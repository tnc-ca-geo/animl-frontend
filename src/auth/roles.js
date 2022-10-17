const MANAGER = 'project_manager';
const MEMBER = 'project_member';
const OBSERVER = 'project_observer';

export const WRITE_OBJECTS_ROLES =              [MANAGER, MEMBER];
export const WRITE_VIEWS_ROLES =                [MANAGER, MEMBER];
export const WRITE_IMAGES_ROLES =               [MANAGER];
export const WRITE_DEPLOYMENTS_ROLES =          [MANAGER];
export const WRITE_AUTOMATION_RULES_ROLES =     [MANAGER];
export const WRITE_CAMERA_REGISTRATION_ROLES =  [MANAGER];
export const QUERY_WITH_CUSTOM_FILTER =         [MANAGER];
export const READ_STATS_ROLES =                 [MANAGER];
export const EXPORT_DATA_ROLES =                [MANAGER];

export const hasRole = (currRoles, targetRoles = []) => (
  currRoles && currRoles.some((role) => targetRoles.includes(role))
);