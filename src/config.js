export const DATE_FORMAT_EXIF = 'YYYY:MM:DD HH:mm:ss';
export const DATE_FORMAT_READABLE = 'MMM D, YYYY hh:mm:ss';
export const DATE_FORMAT_READABLE_SHORT = 'MMM D, YYYY';

const API_URLS = {
  development: 'https://qxtg8jjpqf.execute-api.us-west-2.amazonaws.com/dev/external/',
  staging: 'https://qxtg8jjpqf.execute-api.us-west-2.amazonaws.com/dev/external/',
  production: 'https://ffblbru7zk.execute-api.us-west-2.amazonaws.com/prod/external/'
};

const IMAGES_URLS = {
  development: 'https://d1zv5k0v4jdrjr.cloudfront.net/',
  staging: 'https://d1zv5k0v4jdrjr.cloudfront.net/',
  production: 'https://doo86afh9dk8g.cloudfront.net/'  
};

const stage = process.env.REACT_APP_STAGE || process.env.NODE_ENV;

export const API_URL = API_URLS[stage];
export const IMAGES_URL = IMAGES_URLS[stage];
export const IMAGE_QUERY_LIMITS = [10, 50, 100];

export const SUPPORTED_CAM_MAKES = ['BuckEyeCam'];