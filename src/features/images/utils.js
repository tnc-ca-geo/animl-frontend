const enrichImages = (res, camConfigs) => {
  for (const img of res.images.images) {
    // map deploymentID to deployment name
    const camConfig = camConfigs.find((c) => c._id === img.cameraId);
    const deployment = camConfig
      ? camConfig.deployments.find((d) => d._id === img.deploymentId).name
      : 'unknown';
    img.deploymentName = deployment;
  }
  return res;
};

export { enrichImages };
