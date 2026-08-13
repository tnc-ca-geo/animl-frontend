import { createListenerMiddleware } from '@reduxjs/toolkit';
import { LOCATION_CHANGE, replace } from 'connected-react-router';
import { batch } from 'react-redux';
import {
  fetchProject,
  fetchProjectStubs,
  getProjectStubsSuccess,
  projectChanged,
  selectProjectStubs,
  selectProjectStubsLoading,
  selectSelectedProject,
  selectSelectedProjectId,
  selectSelectedViewId,
  setSelectedProjAndView,
} from './projectsSlice';
import {
  clearImages,
  fetchImageContext,
  preFocusImageStart,
  selectRouterLocation,
} from '../images/imagesSlice';
import { selectUserAuthStatus, userAuthStateChanged } from '../user/userSlice';

export const projectsListener = createListenerMiddleware();

const APP_PATH = 'app';

// `/app/:projId/:viewId`
function getIdsFromPath(pathname) {
  const paths = pathname.split('/').filter((p) => p.length > 0);
  return {
    appActive: paths[0] === APP_PATH,
    projIdInPath: paths[1],
    viewIdInPath: paths[2],
  };
}

function isValidImgId(imgId) {
  const hash = imgId.includes(':') ? imgId.split(':')[1] : imgId;
  return /^[a-f0-9]{32}$/i.test(hash);
}

// every Project is created with an "All images" view, but fall back to the first
// view we know about so a malformed Project can't wedge the router in a loop
function findDefaultViewId(views) {
  if (!views?.length) return null;
  return (views.find((v) => v.name === 'All images') ?? views[0])._id;
}

/**
 * Single source of truth for Project & View selection.
 *
 * The URL drives Redux, never the other way around: this listener reads
 * `/app/:projId/:viewId`, fills in any missing or invalid segments by issuing a
 * `replace()` (which re-triggers this listener), and only once the URL is fully
 * resolved does it fetch Project detail and commit the selection to state.
 *
 * NOTE: this app renders with React 16 via `ReactDOM.render`, so React only
 * auto-batches dispatches made from its own event handlers and effect flushes.
 * This effect runs in a promise microtask, outside React, so every related group
 * of dispatches MUST be wrapped in `batch()`. Without it each dispatch forces a
 * separate render and `ImagesPanel` fires `fetchImages` against half-applied
 * state (e.g. a new project id but the previous view's filters).
 */
projectsListener.startListening({
  predicate: (action) =>
    action.type === LOCATION_CHANGE ||
    getProjectStubsSuccess.match(action) ||
    userAuthStateChanged.match(action),
  effect: async (action, listenerApi) => {
    // a newer navigation supersedes any reconciliation still in flight
    listenerApi.cancelActiveListeners();

    const state = listenerApi.getState();

    // the initial LOCATION_CHANGE fires before Amplify has resolved the session,
    // so wait for authentication before touching the API. this listener re-runs
    // on userAuthStateChanged.
    if (selectUserAuthStatus(state) !== 'authenticated') return;

    const routerLocation = selectRouterLocation(state);
    const { appActive, projIdInPath, viewIdInPath } = getIdsFromPath(routerLocation.pathname);
    if (!appActive) return;

    // must be read before this effect awaits anything - RTK only allows
    // getOriginalState() to be called synchronously
    const prevImgId = selectRouterLocation(listenerApi.getOriginalState()).query?.img;

    // 1. make sure we know which Projects the user has access to
    const stubs = selectProjectStubs(state);
    const stubsLoading = selectProjectStubsLoading(state);
    if (!stubs.length) {
      if (!stubsLoading.isLoading && !stubsLoading.noneFound && !stubsLoading.errors) {
        // this listener re-runs on getProjectStubsSuccess
        listenerApi.dispatch(fetchProjectStubs());
      }
      return;
    }

    // 2. resolve the Project in the URL, falling back to the first one
    const projStub = stubs.find((p) => p._id === projIdInPath) ?? stubs[0];
    const defaultViewId = findDefaultViewId(projStub.views);
    if (!defaultViewId) return; // Project has no views; nothing to navigate to
    if (projStub._id !== projIdInPath) {
      listenerApi.dispatch(replace(`/${APP_PATH}/${projStub._id}/${defaultViewId}`));
      return;
    }

    // 3. resolve the View in the URL, falling back to "All images"
    const viewInStub = projStub.views.some((v) => v._id === viewIdInPath);
    if (!viewInStub) {
      listenerApi.dispatch(replace(`/${APP_PATH}/${projStub._id}/${defaultViewId}`));
      return;
    }

    // 4. fetch Project detail if we don't already have it
    if (selectSelectedProject(listenerApi.getState())?._id !== projStub._id) {
      batch(() => {
        listenerApi.dispatch(projectChanged(projStub._id));
        listenerApi.dispatch(clearImages());
      });
      await listenerApi.dispatch(fetchProject(projStub._id));
      if (selectSelectedProject(listenerApi.getState())?._id !== projStub._id) {
        return; // fetch failed; the error toast will explain why
      }
    }

    const currentState = listenerApi.getState();
    const projChanged = selectSelectedProjectId(currentState) !== projStub._id;
    const viewChanged = selectSelectedViewId(currentState) !== viewIdInPath;
    const imgId = routerLocation.query?.img;
    const focusImage =
      imgId && isValidImgId(imgId) && (projChanged || viewChanged || imgId !== prevImgId);

    batch(() => {
      // 5. commit the selection. dispatching setSelectedProjAndView also runs
      // the setActiveFiltersToSelectedView middleware, so the new project, view
      // and filters all land in the same render.
      if (projChanged || viewChanged) {
        listenerApi.dispatch(
          setSelectedProjAndView({ projId: projStub._id, viewId: viewIdInPath }),
        );
      }

      // 6. if 'img' is in the query params, kick off the pre-focused-image
      // initialization sequence. This has to share a batch with step 5 so that
      // getImageContextStart (dispatched synchronously by fetchImageContext) is
      // applied before ImagesPanel re-renders - it's what stops the panel from
      // fetching the view's images out from under the image we're focusing.
      if (focusImage) {
        listenerApi.dispatch(preFocusImageStart(imgId));
        listenerApi.dispatch(fetchImageContext(imgId));
      }
    });
  },
});
