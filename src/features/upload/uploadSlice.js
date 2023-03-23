import { createSlice } from "@reduxjs/toolkit";
import { Auth } from 'aws-amplify';
import { call } from '../../api';

const initialState = {
  batchStates: [],
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
    }
  }
};

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
      const { batches, pageInfo } = payload.batches;

      const ls = {
        isLoading: true,
        operation: 'fetching',
        errors: null,
      }
      state.batchStates = batches.batches;
      state.loadingStates.batchStates = {
        ...state.loadingStates.batchStates,
        ...ls
      };
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
    }
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
} = uploadSlice.actions;

// bulk upload thunk
export const uploadFile = (payload) => async (dispatch, getState) => {
  try {
    const currentUser = await Auth.currentAuthenticatedUser();
    const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
    if (token) {
      dispatch(uploadStart());

      const { file } = payload;
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
      })

      dispatch(uploadSuccess());
      dispatch(fetchBatches());
    }
  } catch (err) {
    console.log('err: ', err)
    dispatch(uploadFailure(err))
  }
}

export const fetchBatches = () => async (dispatch, getState) => {
  try {
    const currentUser = await Auth.currentAuthenticatedUser();
    const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
    if (token) {
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);
      const batches = await call({
        request: 'getBatches',
        projId: selectedProj._id
      })
      dispatch(fetchBatchesSuccess({ batches }));
    }
  } catch (err) {
    console.log('err: ', err)
    dispatch(fetchBatchesFailure(err))
  }
}

export const selectBatchStates = state => state.uploads.batchStates;
export const selectUploadsLoading = state => state.uploads.loadingStates.upload;

export default uploadSlice.reducer;
