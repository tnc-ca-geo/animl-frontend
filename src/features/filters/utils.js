const normalizeFilters = (
  newActiveFilts, 
  availFilts,
  filterCats = ['cameras', 'deployments', 'labels']
) => {
  
  // if all available ids are selected for a filter category, set to null
  for (const filtCat of filterCats) {
    const filtKey = filtCat === 'labels' ? 'categories' : 'ids';  // TODO: remove this once we use labels.ids
    const availIncIds = availFilts[filtCat][filtKey];
    const activeIncIds = newActiveFilts[filtCat];
    if ((availIncIds && activeIncIds) &&
        (availIncIds.length === activeIncIds.length)) {
      newActiveFilts[filtCat] = null;
    }
  }

  return newActiveFilts;
};

export {
  normalizeFilters,
};
