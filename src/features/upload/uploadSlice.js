import { createSlice } from "@reduxjs/toolkit";
import { Auth } from 'aws-amplify';
import { call } from '../../api';

const initialState = {
  batchStates: [],
  errorsExport: null,
  pageInfo: {
    hasNext: false,
    hasPrevious: false,
  },
  loadingStates: {
    upload: {
      isLoading: false,
      operation: null,
      errors: null,
      progress: 0,
    },
    batchStates: {
      isLoading: false,
      operation: null,
      errors: null,
      progress: 0,
    },
    stopBatch: {
      isLoading: false,
      operation: null,
      errors: null,
    },
    errorsExport: {
      isLoading: false,
      errors: null,
      noneFound: false,
    },
  }
};

const equalBatches = (batch1, batch2) => {
  // Returns true if two arrays of batches contain the same batches.
  // NOTE: This doesn't mean the objects in each array are equal.
  //
  // We use this do work out if we need to update the objects currently in
  // state (if true) or if we need to overwrite the state (if false). 

  if (batch1.length !== batch2.length) return false;

  const batch1Ids = batch1.map(({ _id }) => _id).sort();
  const batch2Ids = batch2.map(({ _id }) => _id).sort();
  return JSON.stringify(batch1Ids) === JSON.stringify(batch2Ids);
}

const mergeBatchData = (oldBatchData, newBatchData) => {
  // Merges two arrays of batches, used to update batch data with the `remaining` value
  if (oldBatchData.length === 0) {
    return newBatchData;
  }

  return oldBatchData.map((existingBatch) => {
    const batchUpdate = newBatchData.find(({ _id }) => _id === existingBatch._id);
    if (!batchUpdate) {
      return existingBatch;
    }

    return {
      ...existingBatch,
      ...batchUpdate
    }
  });
}

export const uploadSlice = createSlice({
  name: 'uploads',
  initialState,
  reducers: {
    uploadStart: (state) => {
      const ls = {
        isLoading: true,
        operation: 'uploading',
        errors: null,
        progress: 0,
      }
      state.loadingStates.upload = {
        ...state.loadingStates.upload,
        ...ls
      };
    },

    uploadFailure: (state, { payload }) => {
      const ls = {
        isLoading: false,
        operation: null,
        errors: payload,
      }
      state.loadingStates.upload = {
        ...state.loadingStates.upload,
        ...ls
      };
    },

    uploadSuccess: (state) => {
      const ls = {
        isLoading: false,
        operation: null,
      }
      state.loadingStates.upload = {
        ...state.loadingStates.upload,
        ...ls
      };
    },

    uploadProgress: (state, { payload }) => {
      const ls = {
        progress: payload.progress
      }
      state.loadingStates.upload = {
        ...state.loadingStates.upload,
        ...ls
      };
    },

    fetchBatchesStart: (state) => {
      const ls = {
        isLoading: true,
        operation: 'fetching',
        errors: null,
      }
      state.loadingStates.batchStates = {
        ...state.loadingStates.batchStates,
        ...ls
      };
    },

    fetchBatchesSuccess: (state, { payload }) => {
      const { batches, pageInfo } = payload.batches.batches;
      console.log('fetchBatchesSuccess: ', payload.batches);

      const ls = {
        isLoading: true,
        operation: null,
        errors: null,
      }

      state.pageInfo = pageInfo;
      state.loadingStates.batchStates = {
        ...state.loadingStates.batchStates,
        ...ls
      };

      if (!equalBatches(state.batchStates, batches)) {
        state.batchStates = batches;
      } else {
        // removes all fields where value === null from the object,
        // so don't overwrite the `remaining` value we have in state
        const newBatchData = batches.map(batch => {
          return Object.keys(batch)
          .filter((key) => batch[key] != null)
          .reduce((obj, key) => ({ ...obj, [key]: batch[key] }), {});
        });
        state.batchStates = mergeBatchData(state.batchStates, newBatchData);
      }
    },

    fetchBatchesFailure: (state, { payload }) => {
      const ls = {
        isLoading: false,
        operation: null,
        errors: payload,
      }
      state.loadingStates.batchStates = {
        ...state.loadingStates.batchStates,
        ...ls
      };
    },

    fetchBatchDetailSuccess: (state, { payload }) => {
      console.log('fetchBatcheDetailSuccess: ', payload.batches);
      const newBatchData = payload.batches.map(({ batch }) => batch);
      state.batchStates = mergeBatchData(state.batchStates, newBatchData);
    },

    stopBatchStart: (state) => {
      const ls = {
        isLoading: true,
        operation: 'stopping',
        errors: null,
      }
      state.loadingStates.stopBatch = {
        ...state.loadingStates.stopBatch,
        ...ls
      };
    },

    stopBatchSuccess: (state) => {
      const ls = {
        isLoading: false,
        operation: null,
        errors: null,
      }
      state.loadingStates.stopBatch = {
        ...state.loadingStates.stopBatch,
        ...ls
      };
    },

    stopBatchFailure: (state, { payload }) => {
      const ls = {
        isLoading: false,
        operation: null,
        errors: payload,
      }
      state.loadingStates.stopBatch = {
        ...state.loadingStates.stopBatch,
        ...ls
      };
    },

    exportErrorsStart: (state) => {
      let ls = state.loadingStates.errorsExport;
      ls.isLoading = true;
      ls.noneFound = false;
    },

    exportErrorsSuccess: (state, { payload }) => {
      console.log('export errors Success: ', payload);
      state.errorsExport = {
        ...state.errorsExport,
        ...payload
      }
      let ls = state.loadingStates.errorsExport;
      ls.isLoading = false;
      ls.noneFound = payload.count === 0;
      ls.errors = null;
    },

    exportErrorsUpdate: (state, { payload }) => {
      console.log('export errors update: ', payload);
      state.errorsExport = payload;
    },

    exportErrorsFailure: (state, { payload }) => {
      console.log('export errors fail: ', payload);
      state.errorsExport = null; 
      let ls = state.loadingStates.errorsExport;
      ls.isLoading = false;
      ls.noneFound = false;
      ls.errors = payload;
    },

    // TODO: how is this used again?
    clearErrorsExport: (state) => { 
      console.log('clearing export errors')
      state.errorsExport = null; 
      state.loadingStates.errorsExport = {
        isLoading: false,
        errors: null,
        noneFound: false,
      }
    },

    // TODO: remember to wire up exportErrors errors
    dismissExportErrorsError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.errorsExport.errors.splice(index, 1);
    },

  }
});

export const {
  uploadStart,
  uploadSuccess,
  uploadFailure,
  uploadProgress,
  fetchBatchesStart,
  fetchBatchesSuccess,
  fetchBatchesFailure,
  fetchBatchDetailSuccess,
  stopBatchStart,
  stopBatchSuccess,
  stopBatchFailure,
  exportErrorsStart,
  exportErrorsSuccess,
  exportErrorsUpdate,
  exportErrorsFailure,
  clearErrorsExport,
  dismissExportErrorsError
} = uploadSlice.actions;

// bulk upload thunk
export const uploadFile = (payload) => async (dispatch, getState) => {
  try {
    const currentUser = await Auth.currentAuthenticatedUser();
    const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
    if (token) {
      dispatch(uploadStart());

      const { file, overrideSerial } = payload;
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);
      const uploadUrl = await call({
        request: 'getSignedUrl',
        projId: selectedProj._id,
        input: {
          originalFile: file.name
        }
      });
      const signedUrl = uploadUrl.createUpload.url;

      // if overrideSerial is provided by user, call updateBatch to set it
      if (overrideSerial.length) {
        console.log('overriding serial with: ', overrideSerial)
        const batch = await call({
          request: 'updateBatch',
          projId: selectedProj._id,
          input: {
            _id: uploadUrl.createUpload.batch,
            overrideSerial
          }
        });
      }

      const xhr = new XMLHttpRequest();
      await new Promise((resolve) => {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            dispatch(uploadProgress({ progress: event.loaded / event.total }))
          }
        });
        xhr.addEventListener("loadend", () => {
          resolve(xhr.readyState === 4 && xhr.status === 200);
        });

        xhr.open('PUT', signedUrl, true);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
        xhr.send(file);
      });

      dispatch(uploadSuccess());
      dispatch(fetchBatches());
    }
  } catch (err) {
    console.log('err: ', err)
    dispatch(uploadFailure(err))
  }
};

export const fetchBatches = (page = 'current') => async (dispatch, getState) => {
  try {
    const currentUser = await Auth.currentAuthenticatedUser();
    const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
    if (token) {
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);
      const userSub = getState().user.sub;
      const pageInfo = getState().uploads.pageInfo;

      console.log('getBatches...')
      const batches = await call({
        request: 'getBatches',
        projId: selectedProj._id,
        input: { user: userSub, pageInfo, page }
      })

      // const ongoingBatches = batches.batches.batches.filter(
      //   ({ processingEnd, remaining }) => !processingEnd && !remaining
      // );

      const ongoingBatches = batches.batches.batches;

      console.log('getBatch for all returned batches...');
      const requests = ongoingBatches.map(({ _id: id }) => call({
        request: 'getBatch',
        projId: selectedProj._id,
        input: { id }
      }));
      Promise.all(requests)
        .then(batches => dispatch(fetchBatchDetailSuccess({ batches })));

      dispatch(fetchBatchesSuccess({ batches }));
    }
  } catch (err) {
    console.log('err: ', err)
    dispatch(fetchBatchesFailure(err))
  }
};

export const stopBatch = (id) => async (dispatch, getState) => {
  try {
    const currentUser = await Auth.currentAuthenticatedUser();
    const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
    if (token) {
      dispatch(stopBatchStart());
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);

      await call({
        request: 'stopBatch',
        projId: selectedProj._id,
        input: { id }
      })

      dispatch(stopBatchSuccess());
      dispatch(fetchBatches());
    }
  } catch (err) {
    console.log('err: ', err)
    dispatch(stopBatchFailure(err))
  }
};

// export errors thunk
export const exportErrors = ({ filters }) => {
  return async (dispatch, getState) => {
    console.log(`uploadSlice - exportErrors() - exporting with filters: `, filters);
    try {

      dispatch(exportErrorsStart());
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
        console.log('imagesSlice() - exportErrors() - res: ', res);
        dispatch(exportErrorsUpdate({ documentId: res.exportErrors.documentId }));
      }
    } catch (err) {
      dispatch(exportErrorsFailure(err));
    }
  };
};

// getErrorsExportStatus thunk
export const getErrorsExportStatus = (documentId) => {
  return async (dispatch, getState) => {
    console.log('uploadSlice() - getErrorsExportStatus() - docId: ', documentId);
    try {
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);

      if (token && selectedProj) {
        const { exportStatus } = await call({
          projId: selectedProj._id,
          request: 'getExportStatus',
          input: { documentId },
        });  
        console.log('uploadSlice() - getErrorsExportStatus() - exportStatus: ', exportStatus)
        
        if (exportStatus.status === 'Success') {
          dispatch(exportErrorsSuccess(exportStatus));
        } else if (exportStatus.status === 'Error' && exportStatus.error) {
          dispatch(exportErrorsFailure(exportStatus.error));
        } else {
          await new Promise(resolve => setTimeout(resolve, 2000));
          dispatch(getErrorsExportStatus(documentId));
        }
      }
    } catch (err) {
      dispatch(exportFailure(err));
    }
  };
};

export const selectBatchStates = state => state.uploads.batchStates;
export const selectBatchPageInfo = state => state.uploads.pageInfo;
export const selectUploadsLoading = state => state.uploads.loadingStates.upload;
export const selectErrorsExport = state => state.uploads.errorsExport;
export const selectErrorsExportLoading = state => state.uploads.loadingStates.errorsExport;
export const selectErrorsExportErrors = state => state.uploads.loadingStates.errorsExport.errors;

export default uploadSlice.reducer;
