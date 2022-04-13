import { current } from "@reduxjs/toolkit";

const normalizeFilters = (
  newActiveFilts, 
  availFilts,
  filterCats = ['cameras', 'deployments', 'labels']
) => {
  // if all available ids are selected for a filter category, set to null
  for (const filtCat of filterCats) {
    console.group('normalizing filters for: ', filtCat);
    const availIds = availFilts[filtCat].ids;
    const activeIds = newActiveFilts[filtCat];
    console.log('availIds: ', current(availIds));
    console.log('activeIds: ', activeIds);
    if ((availIds && activeIds) && (availIds.length === activeIds.length)) {
      console.log('setting active filters to null')
      newActiveFilts[filtCat] = null;
    }
    console.groupEnd();
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
  state.availFilters.labels.ids = labels.categories;
  const noneFound = (labels.categories.length === 0);
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
