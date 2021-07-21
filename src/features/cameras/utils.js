import _ from 'lodash';
import moment from 'moment';
import { DATE_FORMAT_EXIF as EXIF } from '../../config';

const enrichCameras = (cameras) => {
  for (const camera of cameras) {
    const deployments = camera.deployments;

    // Sort chronologically
    let defaultDep = deployments.filter((dep) => dep.name === 'default')[0];
    let chronDeps = _.cloneDeep(deployments);
    chronDeps = chronDeps.filter((dep) => dep.startDate);
    chronDeps.sort((a, b) => {
      const aStart = moment(a.startDate, EXIF);
      const bStart = moment(b.startDate, EXIF);
      return aStart.diff(bStart);
    });

    // add end dates
    chronDeps.forEach((dep, i) => {
      dep.endDate = chronDeps[i + 1] 
        ? chronDeps[i + 1].startDate 
        : null;
    });
    defaultDep.endDate = chronDeps[0] 
      ? chronDeps[0].startDate 
      : null;

    // add default deployment back in
    chronDeps.unshift(defaultDep);
    camera.deployments = chronDeps;
  }
  return cameras;
};

export {
  enrichCameras,
};



