const enrichCameraConfigs = (camConfigs) => {
  for (const camConfig of camConfigs) {
    // add end dates to deployments
    const deps = camConfig.deployments;
    deps.forEach((dep, i) => {
      dep.endDate = deps[i + 1] ? deps[i + 1].startDate : null;
    });
  }
  return camConfigs;
};

export { enrichCameraConfigs };
