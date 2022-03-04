import {
  selectProjects,
  setSelectedView,
  setSelectedProject,
  setSelectedProjAndView
} from "./projectsSlice";

export const projectsMiddleware = store => next => action => {

  if (setSelectedProjAndView.match(action)) {
    console.log('projectsMiddleware() - setSelectedProjAndView: ', action.payload)
    // find and add cameras to payload (used in filtersSlice extraReducers)
    const projects = selectProjects(store.getState());
    const selectedProj = projects.find((proj) => (
      proj._id === action.payload.projId
    ));
    action.payload.cameras = selectedProj.cameras;

    // add default viewId to payload if not specified in payload
    if (!action.payload.viewId) {
      const defaultView = selectedProj.views.find((v) => v.name === 'All images');
      action.payload.viewId = defaultView._id;
    }

    // find and add view to payload (used in setSelectedViewMiddleware)
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
