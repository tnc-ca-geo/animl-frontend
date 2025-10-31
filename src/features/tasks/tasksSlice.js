import { createSlice } from '@reduxjs/toolkit';
import { Auth } from 'aws-amplify';
import { call } from '../../api';
import { enrichCameraConfigs } from './utils';
import {
  fetchProjects,
  setModalOpen,
  setModalContent,
  setSelectedCamera,
} from '../projects/projectsSlice';
import { toggleOpenLoupe } from '../loupe/loupeSlice';
import { setFocus, setSelectedImageIndices } from '../review/reviewSlice.js';
import {
  clearImages,
  fetchImages,
  fetchImagesCount,
  setDeleteImagesAlertStatus,
} from '../images/imagesSlice.js';
import {
  setDeleteCameraAlertStatus,
  clearCameraImageCount,
} from '../cameras/wirelessCamerasSlice.js';

const initialState = {
  loadingStates: {
    stats: {
      taskId: null,
      isLoading: false,
      errors: null,
      noneFound: false,
    },
    burstsStats: {
      taskId: null,
      isLoading: false,
      errors: null,
      noneFound: false,
    },
    independentDetectionStats: {
      taskId: null,
      isLoading: false,
      errors: null,
      noneFound: false,
    },
    annotationsExport: {
      taskId: null,
      isLoading: false,
      errors: null,
      noneFound: false,
    },
    errorsExport: {
      taskId: null,
      batch: null,
      isLoading: false,
      errors: null,
      noneFound: false,
    },
    deployments: {
      taskId: null,
      isLoading: false,
      errors: null,
      reqPayload: null, // we need to store the original request payload for deployments
    },
    cameraSerialNumber: {
      taskId: null,
      isLoading: false,
      errors: null,
    },
    deleteCamera: {
      taskId: null,
      isLoading: false,
      errors: null,
    },
    deleteImages: {
      taskId: null,
      isLoading: false,
      errors: null,
    },
    deleteProjectLabel: {
      taskId: null,
      isLoading: false,
      errors: null,
    },
    setTimestampOffset: {
      taskId: null,
      isLoading: false,
      errors: null,
    },
  },
  imagesStats: null,
  burstsStats: null,
  independentDetectionStats: null,
  annotationsExport: null,
  errorsExport: null,
};

export const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    getTaskFailure: (state, { payload }) => {
      // find the task that failed and update its loading state
      const taskType = Object.keys(state.loadingStates).find((taskType) => {
        return state.loadingStates[taskType].taskId === payload.taskId;
      });
      let ls = state.loadingStates[taskType];
      ls.isLoading = false;
      ls.noneFound = false;
      ls.errors = payload.err;
    },

    // get stats

    getStatsStart: (state) => {
      let ls = state.loadingStates.stats;
      ls.taskId = null;
      ls.isLoading = true;
      ls.errors = null;
      ls.noneFound = false;
    },

    statsUpdate: (state, { payload }) => {
      state.loadingStates.stats.taskId = payload.taskId;
    },

    getStatsSuccess: (state, { payload }) => {
      state.imagesStats = payload.task.output;
      let ls = state.loadingStates.stats;
      ls.isLoading = false;
      ls.noneFound = payload.task.output.imageCount === 0;
      ls.errors = null;
    },

    getStatsFailure: (state, { payload }) => {
      let ls = state.loadingStates.stats;
      ls.isLoading = false;
      ls.noneFound = false;
      ls.errors = [payload.task.output.error];
    },

    clearStats: (state) => {
      state.imagesStats = null;
      state.loadingStates.stats = initialState.loadingStates.stats;
      state.burstsStats = null;
      state.loadingStates.burstsStats = initialState.loadingStates.burstsStats;
      state.independentDetectionStats = null;
      state.loadingStates.independentDetectionStats =
        initialState.loadingStates.independentDetectionStats;
    },

    dismissStatsError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.stats.errors.splice(index, 1);
    },

    // get bursts stats
    getBurstsStatsStart: (state) => {
      let ls = state.loadingStates.burstsStats;
      ls.taskId = null;
      ls.isLoading = true;
      ls.errors = null;
      ls.noneFound = false;
    },

    burstsStatsUpdate: (state, { payload }) => {
      state.loadingStates.burstsStats.taskId = payload.taskId;
    },

    getBurstsStatsSuccess: (state, { payload }) => {
      state.burstsStats = payload.task.output;
      let ls = state.loadingStates.burstsStats;
      ls.isLoading = false;
      ls.noneFound = payload.task.output.burstCount === 0;
      ls.errors = null;
    },

    getBurstsStatsFailure: (state, { payload }) => {
      let ls = state.loadingStates.burstsStats;
      ls.isLoading = false;
      ls.noneFound = false;
      ls.errors = [payload.task.output.error];
    },

    dismissBurstsStatsError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.burstsStats.errors.splice(index, 1);
    },

    // get independent detection stats
    getIndependentDetectionStatsStart: (state) => {
      let ls = state.loadingStates.independentDetectionStats;
      ls.taskId = null;
      ls.isLoading = true;
      ls.errors = null;
      ls.noneFound = false;
    },

    independentDetectionStatsUpdate: (state, { payload }) => {
      state.loadingStates.independentDetectionStats.taskId = payload.taskId;
    },

    getIndependentDetectionStatsSuccess: (state, { payload }) => {
      state.independentDetectionStats = payload.task.output;
      let ls = state.loadingStates.independentDetectionStats;
      ls.isLoading = false;
      ls.noneFound = payload.task.output.detectionsCount === 0;
      ls.errors = null;
    },

    getIndependentDetectionStatsFailure: (state, { payload }) => {
      let ls = state.loadingStates.independentDetectionStats;
      ls.isLoading = false;
      ls.noneFound = false;
      ls.errors = [payload.task.output.error];
    },

    dismissIndependentDetectionStatsError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.independentDetectionStats.errors.splice(index, 1);
    },

    // export annotations

    exportAnnotationsStart: (state) => {
      let ls = state.loadingStates.annotationsExport;
      ls.taskId = null;
      ls.isLoading = true;
      ls.errors = null;
      ls.noneFound = false;
    },

    exportAnnotationsUpdate: (state, { payload }) => {
      state.loadingStates.annotationsExport.taskId = payload.taskId;
    },

    exportAnnotationsSuccess: (state, { payload }) => {
      state.annotationsExport = payload.task.output;
      let ls = state.loadingStates.annotationsExport;
      ls.isLoading = false;
      ls.noneFound = payload.task.output.count === 0;
      ls.errors = null;
    },

    exportAnnotationsFailure: (state, { payload }) => {
      let ls = state.loadingStates.annotationsExport;
      ls.isLoading = false;
      ls.noneFound = false;
      ls.errors = [payload.task.output.error];
    },

    clearExport: (state) => {
      state.annotationsExport = null;
      state.loadingStates.annotationsExport = initialState.loadingStates.annotationsExport;
    },

    dismissExportError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.annotationsExport.errors.splice(index, 1);
    },

    // export image errors

    exportErrorsStart: (state, { payload }) => {
      let ls = state.loadingStates.errorsExport;
      ls.taskId = null;
      ls.batch = payload.batch;
      ls.isLoading = true;
      ls.errors = null;
      ls.noneFound = false;
    },

    exportErrorsUpdate: (state, { payload }) => {
      state.loadingStates.errorsExport.taskId = payload.taskId;
    },

    exportErrorsSuccess: (state, { payload }) => {
      state.errorsExport = {
        ...state.errorsExport,
        ...payload.task.output,
      };
      let ls = state.loadingStates.errorsExport;
      ls.isLoading = false;
      ls.noneFound = payload.task.output.count === 0;
      ls.errors = null;
    },

    exportErrorsFailure: (state, { payload }) => {
      let ls = state.loadingStates.errorsExport;
      ls.isLoading = false;
      ls.noneFound = false;
      ls.errors = [payload.task.output.error];
    },

    clearErrorsExport: (state) => {
      state.errorsExport = null;
      state.loadingStates.errorsExport = initialState.loadingStates.errorsExport;
    },

    dismissErrorsExportError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.errorsExport.errors.splice(index, 1);
    },

    // edit deployments

    editDeploymentsStart: (state, { payload }) => {
      let ls = state.loadingStates.deployments;
      ls.taskId = null;
      ls.reqPayload = payload;
      ls.isLoading = true;
      ls.errors = null;
    },

    editDeploymentsUpdate: (state, { payload }) => {
      state.loadingStates.deployments.taskId = payload.taskId;
    },

    editDeploymentsSuccess: (state) => {
      let ls = state.loadingStates.deployments;
      ls.isLoading = false;
      ls.errors = null;
    },

    editDeploymentsFailure: (state, { payload }) => {
      let ls = state.loadingStates.deployments;
      ls.isLoading = false;
      ls.errors = payload;
    },

    clearDeployments: (state) => {
      state.loadingStates.deployments = initialState.loadingStates.deployments;
    },

    dismissDeploymentsError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.deployments.errors.splice(index, 1);
    },

    // update camera serial number

    updateCameraSerialNumberStart: (state) => {
      let ls = state.loadingStates.cameraSerialNumber;
      ls.taskId = null;
      ls.isLoading = true;
      ls.errors = null;
    },

    updateCameraSerialNumberUpdate: (state, { payload }) => {
      state.loadingStates.cameraSerialNumber.taskId = payload.taskId;
    },

    updateCameraSerialNumberSuccess: (state) => {
      let ls = state.loadingStates.cameraSerialNumber;
      ls.taskId = null;
      ls.isLoading = false;
      ls.errors = null;
    },

    updateCameraSerialNumberFailure: (state, { payload }) => {
      let ls = state.loadingStates.cameraSerialNumber;
      ls.isLoading = false;
      ls.errors = [payload.task.output.error];
    },

    clearCameraSerialNumberTask: (state) => {
      state.loadingStates.cameraSerialNumber = initialState.loadingStates.cameraSerialNumber;
    },

    dismissCameraSerialNumberError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.cameraSerialNumber.taskId = null;
      state.loadingStates.cameraSerialNumber.errors.splice(index, 1);
    },

    // delete camera

    updateDeleteCameraStart: (state) => {
      let ls = state.loadingStates.deleteCamera;
      ls.taskId = null;
      ls.isLoading = true;
      ls.errors = null;
    },

    updateDeleteCameraUpdate: (state, { payload }) => {
      state.loadingStates.deleteCamera.taskId = payload.taskId;
    },

    updateDeleteCameraSuccess: (state) => {
      let ls = state.loadingStates.deleteCamera;
      ls.taskId = null;
      ls.isLoading = false;
      ls.errors = null;
    },

    updateDeleteCameraFailure: (state, { payload }) => {
      let ls = state.loadingStates.deleteCamera;
      ls.isLoading = false;
      ls.errors = [payload.task.output.error];
    },

    clearDeleteCameraTask: (state) => {
      state.loadingStates.deleteCamera = initialState.loadingStates.deleteCamera;
    },

    dismissDeleteCameraError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.deleteCamera.taskId = null;
      state.loadingStates.deleteCamera.errors.splice(index, 1);
    },

    // delete images

    deleteImagesStart: (state) => {
      let ls = state.loadingStates.deleteImages;
      ls.taskId = null;
      ls.isLoading = true;
      ls.errors = null;
    },

    deleteImagesUpdate: (state, { payload }) => {
      state.loadingStates.deleteImages.taskId = payload.taskId;
    },

    deleteImagesSuccess: (state) => {
      let ls = state.loadingStates.deleteImages;
      ls.taskId = null;
      ls.isLoading = false;
      ls.errors = null;
    },

    deleteImagesFailure: (state, { payload }) => {
      let ls = state.loadingStates.deleteImages;
      ls.isLoading = false;
      ls.errors = [payload.task.output.error];
    },

    clearDeleteImagesTask: (state) => {
      state.loadingStates.deleteImages = initialState.loadingStates.deleteImages;
    },

    dismissDeleteImagesError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.deleteImages.taskId = null;
      state.loadingStates.deleteImages.errors.splice(index, 1);
    },

    // delete project label

    deleteProjectLabelTaskStart: (state, { payload }) => {
      // Note: we don't need a deleteProjectLabelTaskUpdate action in this case
      // because we already know the taskId when we start the task
      let ls = state.loadingStates.deleteProjectLabel;
      ls.taskId = payload.taskId;
      ls.isLoading = true;
      ls.errors = null;
    },

    deleteProjectLabelTaskSuccess: (state) => {
      let ls = state.loadingStates.deleteProjectLabel;
      ls.taskId = null;
      ls.isLoading = false;
      ls.errors = null;
    },

    deleteProjectLabelTaskFailure: (state, { payload }) => {
      let ls = state.loadingStates.deleteProjectLabel;
      ls.isLoading = false;
      ls.errors = [payload.task.output.error];
    },

    dismissDeleteProjectLabelTaskError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.deleteProjectLabel.taskId = null;
      state.loadingStates.deleteProjectLabel.errors.splice(index, 1);
    },

    // set timestamp offset

    setTimestampOffsetStart: (state) => {
      let ls = state.loadingStates.setTimestampOffset;
      ls.taskId = null;
      ls.isLoading = true;
      ls.errors = null;
    },

    setTimestampOffsetUpdate: (state, { payload }) => {
      state.loadingStates.setTimestampOffset.taskId = payload.taskId;
    },

    setTimestampOffsetSuccess: (state) => {
      let ls = state.loadingStates.setTimestampOffset;
      ls.taskId = null;
      ls.isLoading = false;
      ls.errors = null;
    },

    setTimestampOffsetFailure: (state, { payload }) => {
      let ls = state.loadingStates.setTimestampOffset;
      ls.isLoading = false;
      // Handle both task failure (payload.task.output.error) and API error (payload)
      ls.errors = payload.task?.output?.error
        ? [payload.task.output.error]
        : [payload];
    },

    clearSetTimestampOffsetTask: (state) => {
      state.loadingStates.setTimestampOffset = initialState.loadingStates.setTimestampOffset;
    },

    dismissSetTimestampOffsetError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.setTimestampOffset.taskId = null;
      state.loadingStates.setTimestampOffset.errors.splice(index, 1);
    },
  },
});

export const {
  getTaskFailure,

  getStatsStart,
  statsUpdate,
  getStatsSuccess,
  getStatsFailure,
  clearStats,
  dismissStatsError,

  getBurstsStatsStart,
  burstsStatsUpdate,
  getBurstsStatsSuccess,
  getBurstsStatsFailure,
  dismissBurstsStatsError,

  getIndependentDetectionStatsStart,
  independentDetectionStatsUpdate,
  getIndependentDetectionStatsSuccess,
  getIndependentDetectionStatsFailure,
  dismissIndependentDetectionStatsError,

  exportAnnotationsStart,
  exportAnnotationsUpdate,
  exportAnnotationsSuccess,
  exportAnnotationsFailure,
  clearExport,
  dismissExportError,

  exportErrorsStart,
  exportErrorsUpdate,
  exportErrorsSuccess,
  exportErrorsFailure,
  clearErrorsExport,
  dismissErrorsExportError,

  editDeploymentsStart,
  editDeploymentsUpdate,
  editDeploymentsFailure,
  editDeploymentsSuccess,
  clearDeployments,
  dismissDeploymentsError,

  updateCameraSerialNumberStart,
  updateCameraSerialNumberUpdate,
  updateCameraSerialNumberSuccess,
  updateCameraSerialNumberFailure,
  clearCameraSerialNumberTask,
  dismissCameraSerialNumberError,

  updateDeleteCameraStart,
  updateDeleteCameraUpdate,
  updateDeleteCameraSuccess,
  updateDeleteCameraFailure,
  clearDeleteCameraTask,
  dismissDeleteCameraError,

  deleteImagesStart,
  deleteImagesUpdate,
  deleteImagesSuccess,
  deleteImagesFailure,
  clearDeleteImagesTask,
  dismissDeleteImagesError,

  deleteProjectLabelTaskStart,
  deleteProjectLabelTaskSuccess,
  deleteProjectLabelTaskFailure,
  dismissDeleteProjectLabelTaskError,

  setTimestampOffsetStart,
  setTimestampOffsetUpdate,
  setTimestampOffsetSuccess,
  setTimestampOffsetFailure,
  clearSetTimestampOffsetTask,
  dismissSetTimestampOffsetError,
} = tasksSlice.actions;

// fetchTask thunk
export const fetchTask = (taskId) => {
  return async (dispatch, getState) => {
    try {
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);

      if (token && selectedProj && taskId) {
        const res = await call({
          projId: selectedProj._id,
          request: 'getTask',
          input: { taskId },
        });

        if (res.task.status === 'SUBMITTED' || res.task.status === 'RUNNING') {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          dispatch(fetchTask(taskId));
        } else {
          // res.tasks.output will be different for each task type, so need to dispatch separate actions
          const dispatchMap = {
            GetStats: {
              COMPLETE: (res) => {
                const id = res.task._id;
                const loadingStates = getState().tasks.loadingStates;
                if (id === loadingStates.stats.taskId) {
                  dispatch(getStatsSuccess(res));
                }
                if (id === loadingStates.burstsStats.taskId) {
                  dispatch(getBurstsStatsSuccess(res));
                }
                if (id === loadingStates.independentDetectionStats.taskId) {
                  dispatch(getIndependentDetectionStatsSuccess(res));
                }
              },
              FAIL: (res) => dispatch(getStatsFailure(res)),
            },
            ExportAnnotations: {
              COMPLETE: (res) => dispatch(exportAnnotationsSuccess(res)),
              FAIL: (res) => dispatch(exportAnnotationsFailure(res)),
            },
            ExportImageErrors: {
              COMPLETE: (res) => dispatch(exportErrorsSuccess(res)),
              FAIL: (res) => dispatch(exportErrorsFailure(res)),
            },
            EditDeployments: {
              COMPLETE: (res) => {
                const operation = res.task.type.charAt(0).toLowerCase() + res.task.type.slice(1);
                const cameraConfig = enrichCameraConfigs([res.task.output])[0];
                const deploymentsLoadingState = getState().tasks.loadingStates.deployments;
                dispatch(
                  editDeploymentsSuccess({
                    projId: selectedProj._id,
                    cameraConfig,
                    operation,
                    reqPayload: deploymentsLoadingState.reqPayload,
                  }),
                );
              },
              FAIL: (res) => dispatch(editDeploymentsFailure(res)),
            },
            UpdateSerialNumber: {
              COMPLETE: () => {
                dispatch(updateCameraSerialNumberSuccess());
                dispatch(toggleOpenLoupe(false));
                dispatch(setModalOpen(false));
                dispatch(setModalContent(null));
                dispatch(setSelectedCamera(null));
                dispatch(fetchProjects({ _ids: [selectedProj._id] }));
              },
              FAIL: (res) => dispatch(updateCameraSerialNumberFailure(res)),
            },
            DeleteCamera: {
              COMPLETE: () => {
                dispatch(updateDeleteCameraSuccess());
                dispatch(toggleOpenLoupe(false));
                dispatch(setModalOpen(false));
                dispatch(setModalContent(null));
                dispatch(setSelectedCamera(null));
                dispatch(setDeleteCameraAlertStatus({ isOpen: false }));
                dispatch(clearCameraImageCount());
                dispatch(fetchProjects({ _ids: [selectedProj._id] }));
              },
              FAIL: (res) => dispatch(updateDeleteCameraFailure(res)),
            },
            DeleteImages: {
              COMPLETE: (res) => {
                const filters = getState().filters.activeFilters;
                dispatch(
                  setFocus({
                    index: { image: null, object: null, label: null },
                    type: 'auto',
                  }),
                );
                dispatch(setSelectedImageIndices([]));
                dispatch(deleteImagesSuccess(res.task.output.imageIds));
                dispatch(setDeleteImagesAlertStatus({ openStatus: false }));
                dispatch(fetchImages(filters));
                dispatch(fetchImagesCount(filters));
              },
              FAIL: (res) => dispatch(deleteImagesFailure(res)),
            },
            DeleteImagesByFilter: {
              COMPLETE: (res) => {
                dispatch(
                  setFocus({
                    index: { image: null, object: null, label: null },
                    type: 'auto',
                  }),
                );
                dispatch(setSelectedImageIndices([]));
                dispatch(deleteImagesSuccess([]));
                dispatch(setDeleteImagesAlertStatus({ openStatus: false }));
                dispatch(fetchImages(res.task.output.filters));
                dispatch(fetchImagesCount(res.task.output.filters));
              },
              FAIL: (res) => dispatch(deleteImagesFailure(res)),
            },
            DeleteProjectLabel: {
              COMPLETE: (res) => {
                dispatch(deleteProjectLabelTaskSuccess(res));
                dispatch(clearImages());
                dispatch(fetchProjects({ _ids: [selectedProj._id] }));
              },
              FAIL: (res) => dispatch(deleteProjectLabelTaskFailure(res)),
            },
            SetTimestampOffsetBatch: {
              COMPLETE: () => {
                const filters = getState().filters.activeFilters;
                dispatch(setTimestampOffsetSuccess());
                dispatch(fetchImages(filters));
              },
              FAIL: (res) => dispatch(setTimestampOffsetFailure(res)),
            },
            SetTimestampOffsetByFilter: {
              COMPLETE: () => {
                const filters = getState().filters.activeFilters;
                dispatch(setTimestampOffsetSuccess());
                dispatch(fetchImages(filters));
              },
              FAIL: (res) => dispatch(setTimestampOffsetFailure(res)),
            },
          };

          if (res.task.type.includes('Deployment')) {
            dispatchMap['EditDeployments'][res.task.status](res);
          } else {
            dispatchMap[res.task.type][res.task.status](res);
          }
        }
      }
    } catch (err) {
      dispatch(getTaskFailure({ err, taskId }));
    }
  };
};

// fetchStats thunk
export const fetchStats = (filters) => {
  return async (dispatch, getState) => {
    try {
      dispatch(getStatsStart());
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);

      if (token && selectedProj) {
        const res = await call({
          projId: selectedProj._id,
          request: 'getStats',
          input: {
            filters,
            aggregationLevel: 'imageAndObject',
          },
        });
        dispatch(statsUpdate({ taskId: res.stats._id }));
      }
    } catch (err) {
      dispatch(getStatsFailure(err));
    }
  };
};

export const fetchBurstsStats = (filters) => {
  return async (dispatch, getState) => {
    try {
      dispatch(getBurstsStatsStart());
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);

      if (token && selectedProj) {
        const res = await call({
          projId: selectedProj._id,
          request: 'getStats',
          input: {
            filters,
            aggregationLevel: 'burst',
          },
        });
        dispatch(burstsStatsUpdate({ taskId: res.stats._id }));
      }
    } catch (err) {
      dispatch(getBurstsStatsFailure(err));
    }
  };
};

export const fetchIndependentDetectionStats = (filters, independenceInterval) => {
  return async (dispatch, getState) => {
    try {
      dispatch(getIndependentDetectionStatsStart());
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);

      if (token && selectedProj) {
        const res = await call({
          projId: selectedProj._id,
          request: 'getStats',
          input: {
            filters,
            aggregationLevel: 'independentDetection',
            independenceInterval,
          },
        });
        dispatch(independentDetectionStatsUpdate({ taskId: res.stats._id }));
      }
    } catch (err) {
      dispatch(getIndependentDetectionStatsFailure(err));
    }
  };
};

// export annotations thunk
export const exportAnnotations = ({
  format,
  filters,
  timezone,
  includeNonReviewed,
  aggregateObjects,
}) => {
  return async (dispatch, getState) => {
    try {
      dispatch(exportAnnotationsStart());
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);

      if (token && selectedProj) {
        const res = await call({
          projId: selectedProj._id,
          request: 'exportAnnotations',
          input: {
            format,
            filters,
            timezone,
            onlyIncludeReviewed: !includeNonReviewed,
            aggregateObjects,
          },
        });
        dispatch(exportAnnotationsUpdate({ taskId: res.exportAnnotations._id }));
      }
    } catch (err) {
      dispatch(exportAnnotationsFailure(err));
    }
  };
};

// export image errors thunk
export const exportErrors = ({ filters }) => {
  return async (dispatch, getState) => {
    try {
      dispatch(exportErrorsStart({ batch: filters.batch }));
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);

      if (token && selectedProj) {
        const res = await call({
          projId: selectedProj._id,
          request: 'exportErrors',
          input: { filters },
        });
        dispatch(exportErrorsUpdate({ taskId: res.exportErrors._id }));
      }
    } catch (err) {
      dispatch(exportErrorsFailure(err));
    }
  };
};

// editDeployments thunk
export const editDeployments = (operation, payload) => {
  return async (dispatch, getState) => {
    try {
      if (!operation || !payload) {
        const err = `An operation (create, update, or delete) is required`;
        throw new Error(err);
      }

      dispatch(editDeploymentsStart(payload));
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);
      const projId = selectedProj._id;

      if (token && selectedProj) {
        const res = await call({
          projId,
          request: operation,
          input: payload,
        });
        dispatch(editDeploymentsUpdate({ taskId: res[operation]._id }));
      }
    } catch (err) {
      console.log(`error attempting to ${operation}: `, err);
      dispatch(editDeploymentsFailure(err));
    }
  };
};

// update camera serial number thunk
export const updateCameraSerialNumber = (payload) => {
  return async (dispatch, getState) => {
    try {
      dispatch(updateCameraSerialNumberStart());
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);

      if (token && selectedProj) {
        const res = await call({
          projId: selectedProj._id,
          request: 'updateCameraSerialNumber',
          input: payload,
        });
        dispatch(updateCameraSerialNumberUpdate({ taskId: res.updateCameraSerialNumber._id }));
      }
    } catch (err) {
      dispatch(updateCameraSerialNumberFailure(err));
    }
  };
};

export const deleteCamera = (payload) => {
  return async (dispatch, getState) => {
    try {
      dispatch(updateDeleteCameraStart());
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);
      if (token && selectedProj) {
        const res = await call({
          projId: selectedProj._id,
          request: 'deleteCameraConfig',
          input: payload,
        });
        dispatch(updateDeleteCameraUpdate({ taskId: res.deleteCameraConfig._id }));
      }
    } catch (err) {
      dispatch(updateDeleteCameraFailure(err));
    }
  };
};

// delete images thunk
export const deleteImagesTask = ({ imageIds = [], filters = null }) => {
  /**
   * Deletes images by either imageIds or by filters, one argument has to be populated and filters take precedence
   * @param {Array} imageIds - array of image ids to delete
   * @param {Object} filters - filters to delete images by
   */
  return async (dispatch, getState) => {
    try {
      dispatch(deleteImagesStart());
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);
      if (token && selectedProj) {
        if (filters !== null) {
          const res = await call({
            projId: selectedProj._id,
            request: 'deleteImagesByFilterTask',
            input: { filters },
          });
          dispatch(deleteImagesUpdate({ taskId: res.deleteImagesByFilterTask._id }));
        } else {
          const res = await call({
            projId: selectedProj._id,
            request: 'deleteImagesTask',
            input: { imageIds },
          });
          dispatch(deleteImagesUpdate({ taskId: res.deleteImagesTask._id }));
        }
      }
    } catch (err) {
      dispatch(deleteImagesFailure(err));
    }
  };
};

// set timestamp offset thunk
export const setTimestampOffsetTask = ({ imageIds = [], filters = null, offsetMs }) => {
  /**
   * Sets timestamp offset for images by either imageIds or by filters
   * @param {Array} imageIds - array of image ids (for single image or batch)
   * @param {Object} filters - filters on which to apply offset
   * @param {Number} offsetMs - offset in milliseconds to apply
   */
  return async (dispatch, getState) => {
    try {
      dispatch(setTimestampOffsetStart());
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);
      if (token && selectedProj) {
        if (filters !== null) {
          const res = await call({
            projId: selectedProj._id,
            request: 'setTimestampOffsetByFilterTask',
            input: { filters, offsetMs },
          });
          dispatch(setTimestampOffsetUpdate({ taskId: res.setTimestampOffsetByFilterTask._id }));
        } else {
          const res = await call({
            projId: selectedProj._id,
            request: 'setTimestampOffsetBatchTask',
            input: { imageIds, offsetMs },
          });
          dispatch(setTimestampOffsetUpdate({ taskId: res.setTimestampOffsetBatchTask._id }));
        }
      }
    } catch (err) {
      dispatch(setTimestampOffsetFailure(err));
    }
  };
};

export const selectImagesStats = (state) => state.tasks.imagesStats;
export const selectStatsLoading = (state) => state.tasks.loadingStates.stats;
export const selectStatsErrors = (state) => state.tasks.loadingStates.stats.errors;
export const selectAnnotationsExport = (state) => state.tasks.annotationsExport;
export const selectAnnotationsExportLoading = (state) =>
  state.tasks.loadingStates.annotationsExport;
export const selectExportAnnotationsErrors = (state) =>
  state.tasks.loadingStates.annotationsExport.errors;
export const selectErrorsExport = (state) => state.tasks.errorsExport;
export const selectErrorsExportLoading = (state) => state.tasks.loadingStates.errorsExport;
export const selectErrorsExportErrors = (state) => state.tasks.loadingStates.errorsExport.errors;
export const selectDeploymentsLoading = (state) => state.tasks.loadingStates.deployments;
export const selectDeploymentsErrors = (state) => state.tasks.loadingStates.deployments.errors;
export const selectCameraSerialNumberLoading = (state) =>
  state.tasks.loadingStates.cameraSerialNumber;
export const selectCameraSerialNumberErrors = (state) =>
  state.tasks.loadingStates.cameraSerialNumber.errors;
export const selectDeleteCameraLoading = (state) => state.tasks.loadingStates.deleteCamera;
export const selectDeleteCameraErrors = (state) => state.tasks.loadingStates.deleteCamera.errors;
export const selectDeleteImagesLoading = (state) => state.tasks.loadingStates.deleteImages;
export const selectDeleteImagesErrors = (state) => state.tasks.loadingStates.deleteImages.errors;
export const selectDeleteProjectLabelLoading = (state) =>
  state.tasks.loadingStates.deleteProjectLabel;
export const selectDeleteProjectLabelErrors = (state) =>
  state.tasks.loadingStates.deleteProjectLabel.errors;
export const selectSetTimestampOffsetLoading = (state) =>
  state.tasks.loadingStates.setTimestampOffset;
export const selectSetTimestampOffsetErrors = (state) =>
  state.tasks.loadingStates.setTimestampOffset.errors;

export const selectBurstsStats = (state) => state.tasks.burstsStats;
export const selectBurstsStatsLoading = (state) => state.tasks.loadingStates.burstsStats;
export const selectIndependentDetectionStats = (state) => state.tasks.independentDetectionStats;
export const selectIndependentDetectionStatsLoading = (state) =>
  state.tasks.loadingStates.independentDetectionStats;

export default tasksSlice.reducer;
