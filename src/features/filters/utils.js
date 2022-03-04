const normalizeFilters = (
  newActiveFilts, 
  availFilts,
  filterCats = ['cameras', 'deployments', 'labels']
) => {

  // if all available ids are selected for a filter category, set to null
  for (const filtCat of filterCats) {
    const availIds = availFilts[filtCat].ids;
    const activeIds = newActiveFilts[filtCat];
    if ((availIds && activeIds) &&
        (availIds.length === activeIds.length)) {
      newActiveFilts[filtCat] = null;
    }
  }

  return newActiveFilts;
};

const updateAvailDepFilters = (state, cameras) => {
  state.availFilters.deployments.isLoading = false;
  state.availFilters.deployments.error = null;
  const newDeployments = cameras.reduce((acc, camera) => {
    for (const dep of camera.deployments) {
      acc.push(dep._id);
    }
    return acc;
  },[]);
  state.availFilters.deployments.ids = newDeployments;
}

const updateAvailCamFilters = (state, cameras) => {
  state.availFilters.cameras.isLoading = false;
  state.availFilters.cameras.error = null;
  state.availFilters.cameras.ids = cameras.map((cam) => cam._id);
  if (cameras.length === 0) {
    state.availFilters.cameras.noneFound = true;
  } 
}

export {
  normalizeFilters,
  updateAvailDepFilters,
  updateAvailCamFilters,
};
