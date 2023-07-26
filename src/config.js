const API_URLS = {
  development: 'https://oogwqd3v1f.execute-api.us-west-2.amazonaws.com/dev/external',
  staging: 'https://oogwqd3v1f.execute-api.us-west-2.amazonaws.com/dev/external',
  production: 'https://ffblbru7zk.execute-api.us-west-2.amazonaws.com/prod/external/'
};

const IMAGES_URLS = {
  development: 'https://dh4emlc8kr8dr.cloudfront.net/',
  staging: 'https://dh4emlc8kr8dr.cloudfront.net/',
  production: 'https://doo86afh9dk8g.cloudfront.net/'  
};

const stage = import.meta.env.VITE_STAGE || process.env.NODE_ENV;

export const API_URL = API_URLS[stage];
export const IMAGES_URL = IMAGES_URLS[stage];
export const IMAGE_QUERY_LIMITS = [10, 50, 100];

export const SUPPORTED_WIRELESS_CAMS = [
  'BuckEyeCam', 'RidgeTec', 'CUDDEBACK'
];

export const IN_MAINTENANCE_MODE = false;

export const GA_CONFIG = {
  trackingId: 'G-V6NSBLL83L',
  gaOptions: {
    cookieDomain: 'none',
    cookieFlags: 'SameSite=None; Secure'
  }
};

export const AWS_AUTH_CONFIG = {
  "aws_project_region": "us-west-2",
  "aws_cognito_identity_pool_id": "us-west-2:6730746c-113a-42c0-ba21-8508bcc5ebb4",
  "aws_cognito_region": "us-west-2",
  "aws_user_pools_id": "us-west-2_9JixUpkYT",
  "aws_user_pools_web_client_id": "40mcp5odj5aek6r91g6quos3er",
  "aws_appsync_authenticationType": "AMAZON_COGNITO_USER_POOLS"
};