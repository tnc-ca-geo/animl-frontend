import {
  selectProjects,
  setSelectedView,
  setSelectedProject
} from "./projectsSlice";

// TODO AUTH - decide whether we intercept and add full project/view to payload 
// here (in middleware), or find it and when action is dispatched

export const projectsMiddleware = store => next => action => {

  if (setSelectedProject.match(action)) {
    // find and add cameras to payload (used in filtersSlice extraReducers)
    const projects = selectProjects(store.getState());
    action.payload.cameras = projects.find((proj) => (
      proj._id === action.payload.projId
    )).cameras;
    next(action);
  }

  else if (setSelectedView.match(action)) {
    // find and add view to payload (used in setSelectedViewMiddleware)
    const projects = selectProjects(store.getState());
    projects.forEach((p) => {
      p.views.forEach((v) => {
        if (v._id === action.payload.viewId) {
          action.payload.view = v;
        }
      })
    });
    next(action);
  }

  else {
    next(action);
  }

};
