const normalizeFilters = (
  newActiveFilts, 
  availFilts,
  filterCats = ['cameras', 'deployments', 'labels']
) => {
  // if all available ids are selected for a filter category, set to null
  for (const filtCat of filterCats) {
    const availIds = availFilts[filtCat].ids;
    const activeIds = newActiveFilts[filtCat];
    if ((availIds && activeIds) && (availIds.length === activeIds.length)) {
      newActiveFilts[filtCat] = null;
    }
  }
  return newActiveFilts;
};

const updateAvailDepFilters = (state, camConfigs) => {
  const newDeps = camConfigs.reduce((acc, camConfig) => {
    for (const dep of camConfig.deployments) {
      acc.push(dep._id);
    }
    return acc;
  },[]);
  state.availFilters.deployments.ids = newDeps;
}

const updateAvailCamFilters = (state, camConfigs) => {
  state.availFilters.cameras.ids = camConfigs.map((cc) => cc._id);
};

const updateAvailLabelFilters = (state, labels) => {
  const categories = labels.map(({ name }) => name);
  state.availFilters.labels.ids = categories;
  const noneFound = (categories.length === 0);
  state.availFilters.labels.loadingState = {
    isLoading: false,
    operation: null,
    errors: null,
    noneFound,
  };
}

export {
  normalizeFilters,
  updateAvailDepFilters,
  updateAvailCamFilters,
  updateAvailLabelFilters,
};
