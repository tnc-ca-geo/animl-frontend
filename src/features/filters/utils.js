const normalizeFilters = (
  newActiveFilts, 
  availFilts,
  filterCats = ['cameras', 'deployments', 'labels']
) => {
  // if all available ids are selected for a filter category, set to null
  for (const filtCat of filterCats) {
    const availIds = availFilts[filtCat].options.map(({ _id }) => _id);
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
      acc.push({ _id: dep._id });
    }
    return acc;
  },[]);
  state.availFilters.deployments.options = newDeps;
}

const updateAvailCamFilters = (state, camConfigs) => {
  state.availFilters.cameras.options = camConfigs.map((cc) => ({ _id: cc._id }));
};

const updateAvailLabelFilters = (state, labels) => {
  const defaultLabelFilters = [
    { 
      _id: 'none',
      name: 'none',
      color: '#AFE790',
      source: 'default'
    }
  ];
  const defaults = defaultLabelFilters.filter((defaultLabel) => (
    !labels.find((lbl) => lbl._id.toString() === defaultLabel._id.toString())
  ));
  state.availFilters.labels.options = [...defaults, ...labels];
};

export {
  normalizeFilters,
  updateAvailDepFilters,
  updateAvailCamFilters,
  updateAvailLabelFilters,
};
