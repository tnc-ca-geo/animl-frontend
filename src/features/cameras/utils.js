import moment from 'moment';

const enrichCameras = (cameras) => {
  for (const camera of cameras.cameras) {
    const deployments = camera.deployments;

    // Sort chronologically, add end dates
    let defaultDep = deployments.filter((dep) => dep.name === 'default')[0];
    let chronDeps = deployments.filter((dep) => dep.startDate);
    chronDeps.sort((a, b) => moment(a.startDate).isBefore(b.startDate));
    chronDeps.forEach((dep, i) => {
      dep.endDate = chronDeps[i + 1] ? chronDeps[i + 1].startDate : null;
    });
    defaultDep.endDate = chronDeps[0] ? chronDeps[0].startDate : null;
    chronDeps.unshift(defaultDep);
    camera.deployments = chronDeps;
  }
  return cameras;
};

export {
  enrichCameras,
};



