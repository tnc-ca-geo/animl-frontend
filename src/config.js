export const DATE_FORMAT_EXIF = 'YYYY:MM:DD hh:mm:ss';
export const DATE_FORMAT_READABLE = 'YYYY-MM-DD hh:mm:ss';

console.log('process.env: ', process.env);
const stage = process.env.REACT_APP_STAGE || process.env.NODE_ENV;

const API_URLS = {
  development: 'https://qxtg8jjpqf.execute-api.us-west-2.amazonaws.com/dev/external/',
  staging: 'https://qxtg8jjpqf.execute-api.us-west-2.amazonaws.com/dev/external/',
  production: 'TODO: add production URL'
};
export const API_URL = API_URLS[stage];

const IMAGES_URLS = {
  devevelopment: 'https://d3ps2k4314vkoe.cloudfront.net/',
  staging: 'https://d3ps2k4314vkoe.cloudfront.net/',
  production: 'TODO: add production URL'
};
export const IMAGES_URL = IMAGES_URLS[stage];

export const IMAGE_QUERY_LIMITS = [10, 50, 100];