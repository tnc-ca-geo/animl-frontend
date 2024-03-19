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
      console.log('getStatsSuccss: ', payload);
      state.imagesStats = payload;
      let ls = state.loadingStates.stats;
      ls.isLoading = false;
      ls.noneFound = payload.stats.imageCount === 0;
      ls.errors = null;
    },

    getStatsFailure: (state, { payload }) => {
      console.log('getStatsFailure: ', payload);
      let ls = state.loadingStates.stats;
      ls.isLoading = false;
      ls.noneFound = false;
      ls.errors = payload;
    },

    clearStats: (state) => {
      state.imagesStats = null;
      state.loadingStates.stats = {
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
      state.export = null;
      state.loadingStates.export = {
        isLoading: true,
        errors: null,
        noneFound: false,
      };
    },

    exportSuccess: (state, { payload }) => {
      state.export = {
        ...state.export,
        ...payload,
      };
      let ls = state.loadingStates.export;
      ls.isLoading = false;
      ls.noneFound = payload.meta.imageCount === 0;
      ls.errors = null;
    },

    exportUpdate: (state, { payload }) => {
      state.export = payload;
    },

    exportFailure: (state, { payload }) => {
      state.export = null;
      let ls = state.loadingStates.export;
      ls.isLoading = false;
      ls.noneFound = false;
      ls.errors = payload;
    },

    clearExport: (state) => {
      state.export = null;
      state.loadingStates.export = {
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
      // dispatch(getStatsStart());
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
        // dispatch(statsUpdate({ taskId: res.stats._id }));
      }
    } catch (err) {
      // dispatch(getStatsFailure(err));
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

// // export thunk
// export const exportData = ({ format, filters }) => {
//   return async (dispatch, getState) => {
//     try {
//       dispatch(exportStart());
//       const currentUser = await Auth.currentAuthenticatedUser();
//       const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
//       const projects = getState().projects.projects;
//       const selectedProj = projects.find((proj) => proj.selected);

//       if (token && selectedProj) {
//         const res = await call({
//           projId: selectedProj._id,
//           request: 'export',
//           input: { format, filters },
//         });
//         dispatch(exportUpdate({ documentId: res.export.documentId }));
//       }
//     } catch (err) {
//       dispatch(exportFailure(err));
//     }
//   };
// };

// // getExportStatus thunk
// export const getExportStatus = (documentId) => {
//   return async (dispatch, getState) => {
//     try {
//       const currentUser = await Auth.currentAuthenticatedUser();
//       const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
//       const projects = getState().projects.projects;
//       const selectedProj = projects.find((proj) => proj.selected);

//       if (token && selectedProj) {
//         const { exportStatus } = await call({
//           projId: selectedProj._id,
//           request: 'getExportStatus',
//           input: { documentId },
//         });

//         if (exportStatus.status === 'Success') {
//           dispatch(exportSuccess(exportStatus));
//         } else if (exportStatus.status === 'Error' && exportStatus.error) {
//           dispatch(exportFailure(exportStatus.error));
//         } else {
//           await new Promise((resolve) => setTimeout(resolve, 2000));
//           dispatch(getExportStatus(documentId));
//         }
//       }
//     } catch (err) {
//       dispatch(exportFailure(err));
//     }
//   };
// };

export const selectImagesStats = (state) => state.images.imagesStats;
export const selectStatsLoading = (state) => state.images.loadingStates.stats;
export const selectStatsErrors = (state) => state.images.loadingStates.stats.errors;
export const selectExport = (state) => state.images.export;
export const selectExportLoading = (state) => state.images.loadingStates.export;
export const selectExportDataErrors = (state) => state.images.loadingStates.export.errors;
export const selectDeleteImagesAlertOpen = (state) => state.images.deleteImagesAlertOpen;

// TODO: find a different place for this?
export const selectRouterLocation = (state) => state.router.location;

export default tasksSlice.reducer;
