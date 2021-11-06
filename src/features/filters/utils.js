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

export {
  normalizeFilters,
};
