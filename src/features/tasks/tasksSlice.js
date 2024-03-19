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

      // TODO: this is temporary and currently specific to stats.
      // Once we move export to also use the new task management pattern,
      // we need to abstract this reducer logic quite a bit and rethink
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
      console.log('getStatsSuccess: ', payload);
      state.imagesStats = payload.task.output;
      let ls = state.loadingStates.stats;
      ls.isLoading = false;
      ls.noneFound = payload.task.output.imageCount === 0;
      ls.errors = null;
    },

    getStatsFailure: (state, { payload }) => {
      console.log('getStatsFailure: ', payload);
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

        if (res.task.status === 'COMPLETE') {
          // res.tasks.output will be different for each task type, so need to dispatch separate actions
          if (res.task.type === 'GetStats') {
            dispatch(getStatsSuccess(res));
          }
        } else if (res.task.status === 'FAIL') {
          if (res.task.type === 'GetStats') {
            dispatch(getStatsFailure(res));
          }
        } else if (res.task.status === 'SUBMITTED' || res.task.status === 'RUNNING') {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          dispatch(fetchTask(taskId));
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

export const selectImagesStats = (state) => state.tasks.imagesStats;
export const selectStatsLoading = (state) => state.tasks.loadingStates.stats;
export const selectStatsErrors = (state) => state.tasks.loadingStates.stats.errors;

export default tasksSlice.reducer;
