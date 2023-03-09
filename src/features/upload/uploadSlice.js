import { createSlice } from "@reduxjs/toolkit";
import { Auth } from 'aws-amplify';
import { call } from '../../api';

const initialState = {
  isLoading: false,
  operation: null,
  errors: null,
  progress: 0
};

export const uploadSlice = createSlice({
  name: 'uploads',
  initialState,
  reducers: {
    uploadStart: (state) => {
      state.isLoading = true;
      state.operation = 'uploading';
      state.errors = null;
      state.progress = 0;
    },

    uploadFailure: (state, { payload }) => {
      state.isLoading = false;
      state.operation = null;
      state.errors = payload;
    },

    uploadSuccess: (state, { payload }) => {
      state.isLoading = false;
      state.operation = null;
    },

    uploadProgress: (state, { payload }) => {
      state.progress = payload.progress;
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
