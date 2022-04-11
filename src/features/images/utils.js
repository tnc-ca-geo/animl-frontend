import moment from 'moment';
import {
  DATE_FORMAT_READABLE_SHORT as DFRS,
  DATE_FORMAT_READABLE as DFR,
  DATE_FORMAT_EXIF as EXIF,
  IMAGES_URL, 
} from '../../config';

const enrichImages = (res, camConfigs) => {
  for (const img of res.images.images) {

    const camConfig = camConfigs.find((c) => c._id === img.cameraId);
    const deployment = camConfig 
      ? camConfig.deployments.find((d) => d._id === img.deployment).name
      : 'unknown';
    img.deploymentName = deployment;

    const ext = img.originalFileName.split('.').pop();
    img.url = IMAGES_URL + 'medium/' + img._id + '-medium.' + ext;
    img.thumbUrl = IMAGES_URL + 'small/' + img._id + '-small.' + ext;

    img.dateTimeOriginal = moment(img.dateTimeOriginal, EXIF).format(DFR);
    img.dateAdded = moment(img.dateAdded, EXIF).format(DFRS);

  }
  return res;
};

export {
  enrichImages,
};
