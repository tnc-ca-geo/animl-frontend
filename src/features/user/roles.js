const SUPER_USER = 'super_user';
const MANAGER = 'project_manager';
const MEMBER = 'project_member';
// const OBSERVER = 'project_observer';

export const WRITE_OBJECTS_ROLES = [MANAGER, MEMBER]; // review images
export const WRITE_VIEWS_ROLES = [MANAGER, MEMBER]; // create views
export const EXPORT_DATA_ROLES = [MANAGER, MEMBER]; // export annotation data
export const READ_STATS_ROLES = [MANAGER, MEMBER]; // view stats dashboard
export const WRITE_IMAGES_ROLES = [MANAGER, MEMBER]; // upload images
export const WRITE_DEPLOYMENTS_ROLES = [MANAGER]; // create deployments
export const WRITE_AUTOMATION_RULES_ROLES = [MANAGER]; // create automation rules
export const WRITE_CAMERA_REGISTRATION_ROLES = [MANAGER]; // register wireless cameras
export const WRITE_CAMERA_SERIAL_NUMBER_ROLES = [MANAGER]; // update camera serial number
export const QUERY_WITH_CUSTOM_FILTER = [MANAGER]; // query with MongoDB query syntax
export const DELETE_IMAGES_ROLES = [MANAGER]; // delete images
export const MANAGE_USERS_ROLES = [MANAGER]; // create users and assign roles
export const WRITE_PROJECT_ROLES = [MANAGER]; // manage project settings, labels, and tags
export const READ_COMMENTS_ROLES = [MANAGER, MEMBER]; // read comments
export const WRITE_COMMENTS_ROLES = [MANAGER, MEMBER]; // write comments

export const hasRole = (currRoles, targetRoles = []) =>
  currRoles &&
  (currRoles.includes(SUPER_USER) || currRoles.some((role) => targetRoles.includes(role)));
