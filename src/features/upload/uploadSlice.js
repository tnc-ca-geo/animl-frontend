import { createSlice } from "@reduxjs/toolkit"

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
export const uploadFile = (payload) => async dispatch => {
  try {
    dispatch(uploadStart());
    // TODO: get signed URL
    const signedUrl = 'https://ae03e36e-3454-4e5e-a4e8-1afe525c0019.mock.pstmn.io/file-upload'; 

    var data = new FormData()
    data.append('images_zip', payload.images_zip)

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
      // TODO: use signed URL
      xhr.open('POST', signedUrl, true);
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
      xhr.send(data);
    })

    dispatch(uploadSuccess());
  } catch (err) {
    console.log('err: ', err)
    dispatch(uploadFailure(err))
  }
}

export const selectUploadsLoading = state => state.uploads;

export default uploadSlice.reducer;
