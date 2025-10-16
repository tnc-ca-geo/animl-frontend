import { createBreakpoints } from './app/utils';

const API_URLS = {
  // development: 'http://localhost:3000/dev/external', // if serving animl-api locally
  development: 'https://ko0yratczi.execute-api.us-west-2.amazonaws.com/dev/external', // if using dev animl-api stack on AWS
  staging: 'https://ko0yratczi.execute-api.us-west-2.amazonaws.com/dev/external',
  production: 'https://4634jgo56f.execute-api.us-west-2.amazonaws.com/prod/external/',
};

const stage = import.meta.env.VITE_STAGE || process.env.NODE_ENV;

export const API_URL = API_URLS[stage];
export const IMAGE_QUERY_LIMITS = [10, 50, 100];
export const SYNC_IMAGE_DELETE_LIMIT = 300; // when deleting w/o using task handler
export const ASYNC_IMAGE_DELETE_BY_ID_LIMIT = 3000; // when deleting using task handler (by _id). Constrained by POST request size limits
export const ASYNC_IMAGE_DELETE_BY_FILTER_LIMIT = 200000; // when deleting using task handler (by filter). Constrained by task Lambda timeout

export const SUPPORTED_WIRELESS_CAMS = [
  'BuckEyeCam',
  'RidgeTec',
  'CUDDEBACK',
  'RECONYX',
  'SPARTAN',
];

export const IN_MAINTENANCE_MODE = false;

export const GA_CONFIG = {
  trackingId: 'G-V6NSBLL83L',
  gaOptions: {
    cookieDomain: 'none',
    cookieFlags: 'SameSite=None; Secure',
  },
};

export const AWS_AUTH_CONFIG = {
  aws_project_region: 'us-west-2',
  aws_cognito_identity_pool_id: 'us-west-2:6730746c-113a-42c0-ba21-8508bcc5ebb4',
  aws_cognito_region: 'us-west-2',
  aws_user_pools_id: 'us-west-2_9JixUpkYT',
  aws_user_pools_web_client_id: '40mcp5odj5aek6r91g6quos3er',
  aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS',
};

const globalBreakpointValues = [
  ['xxs', 540],
  ['xs', 768],
  ['sm', 1024],
  ['md', 1280],
  ['lg', 1536],
  ['xl', Infinity],
];

export const globalBreakpoints = createBreakpoints(globalBreakpointValues);
