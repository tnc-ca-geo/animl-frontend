import { IMAGES_URL } from '../../config';

const enrichImages = (res, camConfigs) => {
  for (const img of res.images.images) {
    // map deploymentID to deployment name
    const camConfig = camConfigs.find((c) => c._id === img.cameraId);
    const deployment = camConfig 
      ? camConfig.deployments.find((d) => d._id === img.deploymentId).name
      : 'unknown';
    img.deploymentName = deployment;

    // build urls for small & medium size images
    const ext = img.fileTypeExtension;
    img.url = IMAGES_URL + 'medium/' + img._id + '-medium.' + ext;
    img.thumbUrl = IMAGES_URL + 'small/' + img._id + '-small.' + ext;

  }
  return res;
};

export {
  enrichImages,
};
