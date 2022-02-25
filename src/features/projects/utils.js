const enrichCameras = (cameraConfigs) => {
  console.log('enrichCameras() - ', cameraConfigs);
  for (const cameraConfig of cameraConfigs) {
    // add end dates to deployments
    const deps = cameraConfig.deployments;
    deps.forEach((dep, i) => {
      dep.endDate = deps[i + 1] ? deps[i + 1].startDate : null;
    });
  }
  return cameraConfigs;
};

export {
  enrichCameras,
};