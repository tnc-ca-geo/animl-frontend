import { selectProjects, setSelectedProject } from "./projectsSlice";

export const projectsMiddleware = store => next => action => {

  if (setSelectedProject.match(action)) {
    // find and add cameras to payload (used in filtersSlice extraReducers)
    const projects = selectProjects(store.getState());
    action.payload.cameras = projects.find((proj) => (
      proj._id === action.payload.projId
    )).cameras;
    console.log('projectsMiddleware() - setSelectedProject() - ', action)
    next(action);
  }
  else {
    next(action);
  }

};
