import {
  selectProjects,
  setSelectedView,
  setSelectedProject,
  setSelectedProjAndView
} from "./projectsSlice";

export const projectsMiddleware = store => next => action => {

  if (setSelectedProjAndView.match(action)) {
    console.log('projectsMiddleware() - setSelectedProjAndView: ', action.payload);

    let { projId, viewId } = action.payload;

    // add cameras to payload (used in filtersSlice extraReducers)
    const projects = selectProjects(store.getState());
    const projToSelect = projects.find((proj) => proj._id === projId);
    action.payload.cameras = projToSelect.cameras;

    // add default viewId to payload if not specified in payload
    if (!viewId) {
      const defaultView = projToSelect.views.find((v) => v.name === 'All images');
      action.payload.viewId = defaultView._id;
      viewId = defaultView._id;
    }

    // find and add view to payload (used in setSelectedViewMiddleware)
    projects.forEach((p) => {
      p.views.forEach((v) => {
        if (v._id === viewId) action.payload.view = v;
      });
    });

    // indicate whether there will be a view and/or project change
    const currSelectedProj = projects.find((p) => p.selected);
    const currSelectedView = currSelectedProj.views.find((v) => v.selected);
    action.payload.newProjSelected = currSelectedProj._id !== projId; 
    action.payload.newViewSelected = currSelectedView._id !== viewId; 

    next(action);
  }

  else {
    next(action);
  }

};
