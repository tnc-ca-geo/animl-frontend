import { combineReducers } from '@reduxjs/toolkit';
import { connectRouter } from 'connected-react-router';
import { undoHistoryReducer } from 'redux-undo-redo';
import authReducer from '../features/auth/authSlice';
import filtersReducer from '../features/filters/filtersSlice';
import imagesReducer from '../features/images/imagesSlice';
import wirelessCamerasReducer from '../features/cameras/wirelessCamerasSlice';
import reviewReducer from '../features/review/reviewSlice';
import loupeReducer from '../features/loupe/loupeSlice';
import projectReducer from '../features/projects/projectsSlice';
import usersReducer from '../features/projects/usersSlice';
import trackingReducer from '../features/tracking/trackingSlice';
import uploadReducer from '../features/upload/uploadSlice';

const createRootReducer = (history) =>
  combineReducers({
    router: connectRouter(history),
    auth: authReducer,
    projects: projectReducer,
    users: usersReducer,
    filters: filtersReducer,
    images: imagesReducer,
    wirelessCameras: wirelessCamerasReducer,
    review: reviewReducer,
    loupe: loupeReducer,
    undoHistory: undoHistoryReducer,
    tracking: trackingReducer,
    uploads: uploadReducer,
  });

export default createRootReducer;
