import { createSlice } from '@reduxjs/toolkit';
import { Auth } from 'aws-amplify';
import { call } from '../../api';

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
  },
  imagesStats: null,
  export: null,
};

export const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    getTaskFailure: (state, { payload }) => {
      console.log('getTaskFailure - payload: ', payload);

      // TODO: this is temporary and currently specific to stats and exports.
      // We need to abstract this reducer logic quite a bit and rethink
      // the shape of the state

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
      state.loadingStates.stats = {
        taskId: null,
        isLoading: false,
        errors: null,
        noneFound: false,
      };
    },

    dismissStatsError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.stats.errors.splice(index, 1);
    },

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
      // ls.noneFound = payload.task.output.imageCount === 0; // TODO: need to update this
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
      state.loadingStates.export = {
        taskId: null,
        isLoading: false,
        errors: null,
        noneFound: false,
      };
    },

    dismissExportError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.export.errors.splice(index, 1);
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
  exportSuccess,
  exportUpdate,
  exportFailure,
  clearExport,
  dismissExportError,
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
        console.log('tasksSlice - fetchTask() - res: ', res);

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
            // ImageErrorsExport: {
            //   COMPLETE: (res) => dispatch(exportImageErrorsSuccess(res)),
            //   FAIL: (res) => dispatch(exportImageErrorsFailure(res)),
            // }
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

export const selectImagesStats = (state) => state.tasks.imagesStats;
export const selectStatsLoading = (state) => state.tasks.loadingStates.stats;
export const selectStatsErrors = (state) => state.tasks.loadingStates.stats.errors;
export const selectExport = (state) => state.tasks.export;
export const selectExportLoading = (state) => state.tasks.loadingStates.export;
export const selectExportDataErrors = (state) => state.tasks.loadingStates.export.errors;

export default tasksSlice.reducer;
