import { createSlice } from "@reduxjs/toolkit";
import { Auth } from 'aws-amplify';
import { call } from '../../api';
import { setSelectedProjAndView } from '../projects/projectsSlice';

const initialState = {
  batchStates: [],
  errorsExport: null,
  filter: 'CURRENT',
  pageInfo: {
    hasNext: false,
    hasPrevious: false,
  },
  multipart: {
    batch: null,
    urls: [],
    progressCache: {}
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
      batch: null,
      isLoading: false,
      operation: null,
      errors: null,
    },
    errorsExport: {
      batch: null,
      isLoading: false,
      errors: null,
      noneFound: false,
    },
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
      };
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
      const ls = { progress: payload.progress }
      state.loadingStates.upload = {
        ...state.loadingStates.upload,
        ...ls
      };
    },

    initMultipartUploadStart: (state, { payload }) => {
      console.log('initMultipartUploadStart - payload: ', payload);
      const ls = {
        isLoading: true,
        operation: 'uploading',
        errors: null,
        progress: 0,
      };
      state.loadingStates.upload = {
        ...state.loadingStates.upload,
        ...ls
      };
    },

    initMultipartUploadSuccess: (state, { payload }) => {
      console.log('initMultipartUploadSuccess - payload: ', payload);
      state.multipart.batch = payload.batch;
      state.multipart.urls = payload.urls;
    },

    initMultipartUploadFailure: (state, { payload }) => {
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

    multipartUploadProgress: (state, { payload }) => {
      const { partNumber, loaded, fileSize } = payload;
      state.multipart.progressCache[partNumber] = loaded;

      const bytesUploaded = Object.keys(state.multipart.progressCache)
        .map(Number)
        .reduce((memo, id) => (memo += state.multipart.progressCache[id]), 0);
      const sent = Math.min(bytesUploaded, fileSize);

      const ls = { progress: sent / fileSize };
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
      const ls = {
        isLoading: true,
        operation: null,
        errors: null,
      }
      state.batchStates = batches;
      state.pageInfo = pageInfo;
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
    },

    stopBatchStart: (state, { payload }) => {
      const ls = {
        batch: payload.batch,
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
        batch: null,
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

    exportErrorsStart: (state, { payload }) => {
      state.errorsExport = null; 
      state.loadingStates.errorsExport = {
        batch: payload.batch,
        isLoading: true,
        errors: null,
        noneFound: false,
      }
    },

    exportErrorsSuccess: (state, { payload }) => {
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
      state.errorsExport = payload;
    },

    exportErrorsFailure: (state, { payload }) => {
      state.errorsExport = null; 
      let ls = state.loadingStates.errorsExport;
      ls.isLoading = false;
      ls.noneFound = false;
      ls.errors = payload;
    },

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

    filterBatches: (state, { payload }) => {
      state.filter = payload;
    }

  },

  extraReducers: (builder) => {
    builder
      .addCase(setSelectedProjAndView, (state, { payload }) => {
        if (payload.newProjSelected) {
          // reset upload states
          state.batchStates = [];
          state.filter = 'CURRENT';
          state.errorsExport = null;
          state.pageInfo  = { hasNext: false, hasPrevious: false };

          const loadingReset = { isLoading: false, operation: null,errors: null };
          state.loadingStates = {
            upload: { ...loadingReset, progress: 0 },
            batchStates: { ...loadingReset, progress: 0 },
            stopBatch: loadingReset,
            errorsExport: loadingReset,
          }
        }
      })
  },
});

export const {
  uploadStart,
  uploadSuccess,
  uploadFailure,
  uploadProgress,
  initMultipartUploadStart,
  initMultipartUploadSuccess,
  initMultipartUploadFailure,
  multipartUploadProgress,
  fetchBatchesStart,
  fetchBatchesSuccess,
  fetchBatchesFailure,
  // fetchBatchDetailSuccess,
  stopBatchStart,
  stopBatchSuccess,
  stopBatchFailure,
  exportErrorsStart,
  exportErrorsSuccess,
  exportErrorsUpdate,
  exportErrorsFailure,
  clearErrorsExport,
  dismissExportErrorsError,
  filterBatches
} = uploadSlice.actions;

// init multipart upload thunk
export const initMultipartUpload = (payload) => async (dispatch, getState) => {
  try {
    const currentUser = await Auth.currentAuthenticatedUser();
    const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
    if (token) {
      const { file, overrideSerial } = payload;
      dispatch(initMultipartUploadStart());
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);

      const chunkSizeInMB = 100;
      const chunkSize =  1024 * 1024 * chunkSizeInMB;
      const partCount = Math.ceil(file.size / chunkSize);
      console.log('partCount: ', partCount);

      // initialize multipart upload
      const initRes = await call({
        request: 'createUpload',
        projId: selectedProj._id,
        input: {
          originalFile: file.name,
          partCount
        }
      });
      console.log('createUpload initRes: ', initRes)

      // if overrideSerial is provided by user, call updateBatch to set it
      if (overrideSerial.length) {
        await call({
          request: 'updateBatch',
          projId: selectedProj._id,
          input: {
            _id: initRes.createUpload.batch,
            overrideSerial
          }
        });
      }

      // dispatch(initMultipartUploadSuccess({ ...initRes.createUpload }));
      
      // iterate over presigned urls, reading and chunking file as we go,
      // and creating upload promises for each one
      const uploadedParts = [];
      const activeUploads = initRes.createUpload.urls.map((url, index) => {

        const sentSize = index * chunkSize;
        const chunk = file.slice(sentSize, sentSize + chunkSize);
        const partNumber = index + 1;

        const xhr = new XMLHttpRequest();
        return new Promise((resolve) => {
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              dispatch(multipartUploadProgress({ 
                partNumber,
                loaded: event.loaded,
                fileSize: file.size
              }));
            }
          });
          xhr.addEventListener('loadend', () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
              const ETag = xhr.getResponseHeader('Etag');
              if (ETag) {
                const uploadedPart = {
                  PartNumber: partNumber,
                  ETag: ETag.replaceAll('"', ""),
                };
                uploadedParts.push(uploadedPart);
                resolve(xhr.status);
              }
            }
          });
          xhr.open('PUT', url, true);
          xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
          xhr.send(chunk);
        });
      });

      await Promise.all(activeUploads);

      // close mulitpart upload
      uploadedParts.sort((a, b) => a.PartNumber - b.PartNumber);
      const closeRes = await call({
        request: 'closeUpload',
        projId: selectedProj._id,
        input: {
          batchId: initRes.createUpload.batch,
          multipartUploadId: initRes.createUpload.multipartUploadId,
          parts: uploadedParts
        }
      });
      console.log('closeRes: ', closeRes);

    }
  } catch (err) {
    console.log('err: ', err)
    dispatch(initMultipartUploadFailure(err))
  }
};

// single-threaded upload thunk
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
        request: 'createUpload',
        projId: selectedProj._id,
        input: {
          originalFile: file.name
        }
      });
      const signedUrl = uploadUrl.createUpload.url;

      // if overrideSerial is provided by user, call updateBatch to set it
      if (overrideSerial.length) {
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
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            dispatch(uploadProgress({ progress: event.loaded / event.total }));
          }
        });
        xhr.addEventListener('loadend', () => {
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
    dispatch(uploadFailure(err));
  }
};

export const fetchBatches = (page = 'current') => async (dispatch, getState) => {
  try {
    const currentUser = await Auth.currentAuthenticatedUser();
    const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
    if (token) {
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);
      const pageInfo = getState().uploads.pageInfo;
      const filter = getState().uploads.filter;

      const batches = await call({
        request: 'getBatches',
        projId: selectedProj._id,
        input: { filter, pageInfo, page }
      });

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
      dispatch(stopBatchStart({ batch: id }));
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
export const selectBatchFilter = state => state.uploads.filter;
export const selectBatchPageInfo = state => state.uploads.pageInfo;
export const selectUploadsLoading = state => state.uploads.loadingStates.upload;
export const selectErrorsExport = state => state.uploads.errorsExport;
export const selectErrorsExportLoading = state => state.uploads.loadingStates.errorsExport;
export const selectErrorsExportErrors = state => state.uploads.loadingStates.errorsExport.errors;
export const selectStopBatchLoading = state => state.uploads.loadingStates.stopBatch;


export default uploadSlice.reducer;
