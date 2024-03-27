import { createSlice } from '@reduxjs/toolkit';
import { Auth } from 'aws-amplify';
import { call } from '../../api';
import { enrichCameraConfigs } from './utils';

const initialState = {
  loadingStates: {
    stats: {
      taskId: null,
      isLoading: false,
      errors: null,
      noneFound: false,
    },
    export: {
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
  },
  imagesStats: null,
  export: null,
  errorsExport: null,
};

export const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    getTaskFailure: (state, { payload }) => {
      console.log('getTaskFailure - payload: ', payload);
      // TODO: this is temporary and currently only updates loadingState for stats
      // We need to abstract this reducer logic quite a bit and rethink the shape of the state

      let ls = state.loadingStates.stats;
      ls.isLoading = false;
      ls.noneFound = false;
      ls.errors = payload;
    },

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
    },

    dismissStatsError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.stats.errors.splice(index, 1);
    },

    // export annotations

    exportStart: (state) => {
      let ls = state.loadingStates.export;
      ls.taskId = null;
      ls.isLoading = true;
      ls.errors = null;
      ls.noneFound = false;
    },

    exportUpdate: (state, { payload }) => {
      state.loadingStates.export.taskId = payload.taskId;
    },

    exportSuccess: (state, { payload }) => {
      state.export = payload.task.output;
      let ls = state.loadingStates.export;
      ls.isLoading = false;
      ls.noneFound = payload.task.output.count === 0;
      ls.errors = null;
    },

    exportFailure: (state, { payload }) => {
      let ls = state.loadingStates.export;
      ls.isLoading = false;
      ls.noneFound = false;
      ls.errors = [payload.task.output.error];
    },

    clearExport: (state) => {
      state.export = null;
      state.loadingStates.export = initialState.loadingStates.export;
    },

    dismissExportError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.export.errors.splice(index, 1);
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

    editDeploymentsSuccess: (state, { payload }) => {
      console.log('editDeploymentsSuccess - payload: ', payload);
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

  exportStart,
  exportUpdate,
  exportSuccess,
  exportFailure,
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
} = tasksSlice.actions;

// fetchTask thunk
export const fetchTask = (taskId) => {
  return async (dispatch, getState) => {
    try {
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);

      if (token && selectedProj) {
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
              COMPLETE: (res) => dispatch(getStatsSuccess(res)),
              FAIL: (res) => dispatch(getStatsFailure(res)),
            },
            AnnotationsExport: {
              COMPLETE: (res) => dispatch(exportSuccess(res)),
              FAIL: (res) => dispatch(exportFailure(res)),
            },
            ImageErrorsExport: {
              COMPLETE: (res) => dispatch(exportErrorsSuccess(res)),
              FAIL: (res) => dispatch(exportErrorsFailure(res)),
            },
            CreateDeployment: {
              COMPLETE: (res) => {
                console.log('CreateDeployment COMPLETE res: ', res);
                const operation = 'createDeployment';
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
            UpdateDeployment: {
              COMPLETE: (res) => {
                const operation = 'updateDeployment';
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
            DeleteDeployment: {
              COMPLETE: (res) => {
                const operation = 'deleteDeployment';
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
          };
          dispatchMap[res.task.type][res.task.status](res);
        }
      }
    } catch (err) {
      dispatch(getTaskFailure(err));
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
          input: { filters },
        });
        console.log('tasksSlice - fetchStats() - res: ', res);
        dispatch(statsUpdate({ taskId: res.stats._id }));
      }
    } catch (err) {
      dispatch(getStatsFailure(err));
    }
  };
};

// export annotations thunk
// TODO: rename exportData to exportAnnotations
export const exportData = ({ format, filters }) => {
  return async (dispatch, getState) => {
    try {
      dispatch(exportStart());
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);

      if (token && selectedProj) {
        const res = await call({
          projId: selectedProj._id,
          request: 'export',
          input: { format, filters },
        });
        console.log('exportData - res: ', res);
        dispatch(exportUpdate({ taskId: res.export._id }));
      }
    } catch (err) {
      dispatch(exportFailure(err));
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
        console.log('editDeployments - res: ', res);
        dispatch(editDeploymentsUpdate({ taskId: res[operation]._id }));
      }
    } catch (err) {
      console.log(`error attempting to ${operation}: `, err);
      dispatch(editDeploymentsFailure(err));
    }
  };
};

export const selectImagesStats = (state) => state.tasks.imagesStats;
export const selectStatsLoading = (state) => state.tasks.loadingStates.stats;
export const selectStatsErrors = (state) => state.tasks.loadingStates.stats.errors;
export const selectExport = (state) => state.tasks.export;
export const selectExportLoading = (state) => state.tasks.loadingStates.export;
export const selectExportDataErrors = (state) => state.tasks.loadingStates.export.errors;
export const selectErrorsExport = (state) => state.tasks.errorsExport;
export const selectErrorsExportLoading = (state) => state.tasks.loadingStates.errorsExport;
export const selectExportImageErrorsErrors = (state) =>
  state.tasks.loadingStates.errorsExport.errors;
export const selectDeploymentsLoading = (state) => state.tasks.loadingStates.deployments;
export const selectDeploymentsErrors = (state) => state.tasks.loadingStates.deployments.errors;

export default tasksSlice.reducer;
