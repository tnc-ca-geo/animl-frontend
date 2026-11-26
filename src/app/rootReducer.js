import { combineReducers } from '@reduxjs/toolkit';
import { connectRouter } from 'connected-react-router';
import { undoHistoryReducer } from 'redux-undo-redo';
import userReducer, { userAuthStateChanged } from '../features/user/userSlice';
import filtersReducer from '../features/filters/filtersSlice';
import imagesReducer from '../features/images/imagesSlice';
import wirelessCamerasReducer from '../features/cameras/wirelessCamerasSlice';
import reviewReducer from '../features/review/reviewSlice';
import loupeReducer from '../features/loupe/loupeSlice';
import projectReducer from '../features/projects/projectsSlice';
import usersReducer from '../features/projects/usersSlice';
import trackingReducer from '../features/tracking/trackingSlice';
import uploadReducer from '../features/upload/uploadSlice';
import tasksReducer from '../features/tasks/tasksSlice';
import adminReducer from '../features/admin/adminSlice';

const createRootReducer = (history) => {
  const appReducer = combineReducers({
    router: connectRouter(history),
    user: userReducer,
    projects: projectReducer,
    users: usersReducer,
    filters: filtersReducer,
    images: imagesReducer,
    wirelessCameras: wirelessCamerasReducer,
    review: reviewReducer,
    loupe: loupeReducer,
    undoHistory: undoHistoryReducer,
    tracking: trackingReducer,
    uploads: uploadReducer,
    tasks: tasksReducer,
    admin: adminReducer,
  });

  // On sign-out, drop all cached state so nothing leaks into the next user's
  // session (labels, deployments, cameraConfigs, projectStubs, etc.). Keep
  // router state so connected-react-router stays in sync with the URL. Each
  // slice reducer receives `undefined` and reinitializes itself, and this same
  // action then sets the fresh user slice's authStatus to 'unauthenticated'.
  return (state, action) => {
    if (userAuthStateChanged.match(action) && action.payload.authStatus === 'unauthenticated') {
      state = { router: state.router };
    }
    return appReducer(state, action);
  };
};

export default createRootReducer;
