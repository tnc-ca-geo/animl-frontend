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

const updateAvailLabelFilters = (state, labels) => {
  state.availFilters.labels.ids = labels.categories;
  if (labels.categories.length === 0) {
    state.availFilters.labels.noneFound = true;
  }
}

export {
  normalizeFilters,
  updateAvailDepFilters,
  updateAvailCamFilters,
  updateAvailLabelFilters,
};
