// TODO TIMEZONE: we probably won't need these anymore after shifting to luxon
export const DATE_FORMAT_EXIF = 'YYYY:MM:DD HH:mm:ss';

const API_URLS = {
  development: 'https://jbl8ut0l50.execute-api.us-west-2.amazonaws.com/dev/external/',
  staging: 'https://jbl8ut0l50.execute-api.us-west-2.amazonaws.com/dev/external/',
  production: 'https://ffblbru7zk.execute-api.us-west-2.amazonaws.com/prod/external/'
};

const IMAGES_URLS = {
  development: 'https://dh4emlc8kr8dr.cloudfront.net/',
  staging: 'https://dh4emlc8kr8dr.cloudfront.net/',
  production: 'https://doo86afh9dk8g.cloudfront.net/'  
};

const stage = process.env.REACT_APP_STAGE || process.env.NODE_ENV;

export const API_URL = API_URLS[stage];
export const IMAGES_URL = IMAGES_URLS[stage];
export const IMAGE_QUERY_LIMITS = [10, 50, 100];

export const SUPPORTED_CAM_MAKES = ['BuckEyeCam', 'RidgeTec'];

export const IN_MAINTENANCE_MODE = false;