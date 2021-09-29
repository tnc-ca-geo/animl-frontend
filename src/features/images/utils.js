import moment from 'moment';
import {
  DATE_FORMAT_READABLE as DFR,
  DATE_FORMAT_EXIF as EXIF,
  IMAGES_URL, 
} from '../../config';

const enrichImages = (res, cameras) => {
  for (const img of res.images.images) {
    const camera = cameras.find((c) => c._id === img.cameraSn);
    const deployment = camera 
      ? camera.deployments.find((d) => d._id === img.deployment).name
      : 'unknown';
    img.deploymentName = deployment;

    const ext = img.originalFileName.split('.').pop();
    img.url = IMAGES_URL + 'medium/' + img._id + '-medium.' + ext;
    img.thumbUrl = IMAGES_URL + 'small/' + img._id + '-small.' + ext;

    img.dateTimeOriginal = moment(img.dateTimeOriginal, EXIF).format(DFR);
    img.dateAdded = moment(img.dateAdded, EXIF).format(DFR);
  }
  return res;
};

export {
  enrichImages,
};
