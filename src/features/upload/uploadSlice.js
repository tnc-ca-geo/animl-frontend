import { createSlice } from "@reduxjs/toolkit";
import { Auth } from 'aws-amplify';
import { call } from '../../api';

const initialState = {
  loadingStates: {
    upload: {
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
      state.loadingStates.projects = {
        ...state.loadingStates.projects,
        ...ls
      };
    },

    uploadFailure: (state, { payload }) => {
      const ls = {
        isLoading: false,
        operation: null,
        errors: payload,
      }
      state.loadingStates.projects = {
        ...state.loadingStates.projects,
        ...ls
      };
    },

    uploadSuccess: (state) => {
      const ls = {
        isLoading: false,
        operation: null,
      }
      state.loadingStates.projects = {
        ...state.loadingStates.projects,
        ...ls
      };
    },

    uploadProgress: (state, { payload }) => {
      const ls = {
        progress: payload.progress
      }
      state.loadingStates.projects = {
        ...state.loadingStates.projects,
        ...ls
      };
    },
  }
});

export const {
  uploadStart,
  uploadSuccess,
  uploadFailure,
  uploadProgress,
} = uploadSlice.actions;

// bulk upload thunk
export const uploadFile = (payload) => async (dispatch, getState) => {
  try {
    const currentUser = await Auth.currentAuthenticatedUser();
    const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
    if (token) {
      dispatch(uploadStart());

      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);
      const uploadUrl = await call({
        request: 'getSignedUrl',
        projId: selectedProj._id
      });
      const signedUrl = uploadUrl.createUpload.url;
      const { file } = payload;

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
    }
  } catch (err) {
    console.log('err: ', err)
    dispatch(uploadFailure(err))
  }
}

export const selectUploadsLoading = state => state.uploads;

export default uploadSlice.reducer;
