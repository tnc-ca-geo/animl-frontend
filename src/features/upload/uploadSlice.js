import { createSlice } from '@reduxjs/toolkit';
import { Auth } from 'aws-amplify';
import { call } from '../../api';
import { setSelectedProjAndView } from '../projects/projectsSlice';
import { normalizeErrors } from '../../app/utils';

const initialState = {
  batchStates: [],
  errorsExport: null,
  filter: 'CURRENT',
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
      partsProgress: {},
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
    redriveBatch: {
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
  },
};

export const uploadSlice = createSlice({
  name: 'uploads',
  initialState,
  reducers: {
    // upload batch

    uploadStart: (state) => {
      const ls = {
        isLoading: true,
        operation: 'uploading',
      };
      state.loadingStates.upload = {
        ...initialState.loadingStates.upload,
        ...ls,
      };
    },

    uploadFailure: (state, { payload }) => {
      const ls = { errors: payload };
      state.loadingStates.upload = {
        ...initialState.loadingStates.upload,
        ...ls,
      };
    },

    uploadSuccess: (state) => {
      state.loadingStates.upload = {
        ...state.loadingStates.upload,
        ...initialState.loadingStates.upload,
      };
    },

    uploadProgress: (state, { payload }) => {
      const ls = { progress: payload.progress };
      state.loadingStates.upload = {
        ...state.loadingStates.upload,
        ...ls,
      };
    },

    multipartUploadProgress: (state, { payload }) => {
      const { partNumber, loaded, fileSize } = payload;
      const { partsProgress } = state.loadingStates.upload;
      partsProgress[partNumber] = loaded;

      const bytesUploaded = Object.keys(partsProgress)
        .map(Number)
        .reduce((memo, id) => (memo += partsProgress[id]), 0);
      const sent = Math.min(bytesUploaded, fileSize);

      const ls = { progress: sent / fileSize };
      state.loadingStates.upload = {
        ...state.loadingStates.upload,
        ...ls,
      };
    },

    dismissUploadError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.upload.errors.splice(index, 1);
    },

    // fetch batch

    fetchBatchesStart: (state) => {
      const ls = {
        isLoading: true,
        operation: 'fetching',
        errors: null,
      };
      state.loadingStates.batchStates = {
        ...state.loadingStates.batchStates,
        ...ls,
      };
    },

    fetchBatchesSuccess: (state, { payload }) => {
      const { batches, pageInfo } = payload.batches.batches;
      const ls = {
        isLoading: false,
        operation: null,
        errors: null,
      };
      state.batchStates = batches;
      state.pageInfo = pageInfo;
      state.loadingStates.batchStates = {
        ...state.loadingStates.batchStates,
        ...ls,
      };
    },

    fetchBatchesFailure: (state, { payload }) => {
      const ls = {
        isLoading: false,
        operation: null,
        errors: payload,
      };
      state.loadingStates.batchStates = {
        ...state.loadingStates.batchStates,
        ...ls,
      };
    },

    // stop batch

    stopBatchStart: (state, { payload }) => {
      const ls = {
        batch: payload.batch,
        isLoading: true,
        operation: 'stopping',
        errors: null,
      };
      state.loadingStates.stopBatch = {
        ...state.loadingStates.stopBatch,
        ...ls,
      };
    },

    stopBatchSuccess: (state) => {
      const ls = {
        batch: null,
        isLoading: false,
        operation: null,
        errors: null,
      };
      state.loadingStates.stopBatch = {
        ...state.loadingStates.stopBatch,
        ...ls,
      };
    },

    stopBatchFailure: (state, { payload }) => {
      const ls = {
        isLoading: false,
        operation: null,
        errors: payload,
      };
      state.loadingStates.stopBatch = {
        ...state.loadingStates.stopBatch,
        ...ls,
      };
    },

    // redrive batch

    redriveBatchStart: (state, { payload }) => {
      const ls = {
        batch: payload.batch,
        isLoading: true,
        operation: 'redriving',
        errors: null,
      };
      state.loadingStates.redriveBatch = {
        ...state.loadingStates.redriveBatch,
        ...ls,
      };
    },

    redriveBatchSuccess: (state) => {
      const ls = {
        batch: null,
        isLoading: false,
        operation: null,
        errors: null,
      };
      state.loadingStates.redriveBatch = {
        ...state.loadingStates.redriveBatch,
        ...ls,
      };
    },

    redriveBatchFailure: (state, { payload }) => {
      const ls = {
        isLoading: false,
        operation: null,
        errors: payload,
      };
      state.loadingStates.redriveBatch = {
        ...state.loadingStates.redriveBatch,
        ...ls,
      };
    },

    dismissRedriveBatchError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.redriveBatch.errors.splice(index, 1);
    },

    // export image errors

    exportErrorsStart: (state, { payload }) => {
      state.errorsExport = null;
      state.loadingStates.errorsExport = {
        batch: payload.batch,
        isLoading: true,
        errors: null,
        noneFound: false,
      };
    },

    exportErrorsSuccess: (state, { payload }) => {
      state.errorsExport = {
        ...state.errorsExport,
        ...payload,
      };
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
      state.errorsExport = null;
      state.loadingStates.errorsExport = {
        isLoading: false,
        errors: null,
        noneFound: false,
      };
    },

    dismissExportErrorsError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.errorsExport.errors.splice(index, 1);
    },

    filterBatches: (state, { payload }) => {
      state.filter = payload;
    },
  },

  extraReducers: (builder) => {
    builder.addCase(setSelectedProjAndView, (state, { payload }) => {
      if (payload.newProjSelected) {
        // reset upload states
        state = initialState;
      }
    });
  },
});

export const {
  uploadStart,
  uploadSuccess,
  uploadFailure,
  uploadProgress,
  multipartUploadProgress,
  dismissUploadError,
  fetchBatchesStart,
  fetchBatchesSuccess,
  fetchBatchesFailure,
  // fetchBatchDetailSuccess,
  stopBatchStart,
  stopBatchSuccess,
  stopBatchFailure,
  redriveBatchStart,
  redriveBatchSuccess,
  redriveBatchFailure,
  dismissRedriveBatchError,
  exportErrorsStart,
  exportErrorsSuccess,
  exportErrorsUpdate,
  exportErrorsFailure,
  clearErrorsExport,
  dismissExportErrorsError,
  filterBatches,
} = uploadSlice.actions;

// multipart upload thunk (for zip files > 100 MB)
export const uploadMultipartFile = (payload) => async (dispatch, getState) => {
  try {
    const currentUser = await Auth.currentAuthenticatedUser();
    const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();

    if (token) {
      dispatch(uploadStart());

      const { file, overrideSerial } = payload;
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);

      const chunkSizeInMB = 100;
      const chunkSize = 1024 * 1024 * chunkSizeInMB;
      const partCount = Math.ceil(file.size / chunkSize);

      // initialize multipart upload
      const initRes = await call({
        request: 'createUpload',
        projId: selectedProj._id,
        input: {
          originalFile: file.name,
          partCount,
        },
      });

      // if overrideSerial is provided by user, call updateBatch to set it
      if (overrideSerial.length) {
        await call({
          request: 'updateBatch',
          projId: selectedProj._id,
          input: {
            _id: initRes.createUpload.batch,
            overrideSerial,
          },
        });
      }

      const parts = initRes.createUpload.urls.map((url, index) => ({ url, index }));
      const uploadedParts = [];
      const activeConnections = {};

      // create XHR request and handle progress, errors, etc.
      const sendChunk = (url, chunk, partNumber) => {
        return new Promise((resolve, reject) => {
          if (!window.navigator.onLine) {
            reject(new Error('No internet connection'));
          }

          const xhr = (activeConnections[partNumber] = new XMLHttpRequest());
          const abort = () => xhr.abort();

          const handleError = (abort) => {
            delete activeConnections[partNumber];
            reject();
            window.removeEventListener('offline', abort);
          };

          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              dispatch(multipartUploadProgress({ partNumber, loaded: event.loaded, fileSize: file.size }));
            }
          });

          xhr.addEventListener('loadend', () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
              delete activeConnections[partNumber];
              const ETag = xhr.getResponseHeader('Etag');
              if (ETag) {
                const uploadedPart = {
                  PartNumber: partNumber,
                  ETag: ETag.replaceAll('"', ''),
                };
                uploadedParts.push(uploadedPart);
                resolve(xhr.status);
                window.removeEventListener('offline', abort);
              }
            } else {
              handleError(abort);
            }
          });

          xhr.onerror = () => handleError(abort);
          xhr.ontimeout = () => handleError(abort);
          xhr.onabort = () => handleError(abort);
          xhr.open('PUT', url, true);
          xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
          window.addEventListener('offline', abort);
          xhr.send(chunk);
          sendNext();
        });
      };

      // complete the upload
      const complete = async (error) => {
        if (error) {
          let errs = normalizeErrors(error, 'UPLOAD_FAILED');
          dispatch(uploadFailure(errs));
        } else {
          uploadedParts.sort((a, b) => a.PartNumber - b.PartNumber);
          await call({
            request: 'closeUpload',
            projId: selectedProj._id,
            input: {
              batchId: initRes.createUpload.batch,
              multipartUploadId: initRes.createUpload.multipartUploadId,
              parts: uploadedParts,
            },
          });

          dispatch(uploadSuccess());
          dispatch(fetchBatches());
        }
      };

      // pop off a part, initiate upload, and handle retries
      const sendNext = (retry = 0) => {
        const numberOfActiveConnections = Object.keys(activeConnections).length;
        if (!parts.length) {
          if (numberOfActiveConnections === 0) {
            complete();
          }
          return;
        }

        const { url, index } = parts.pop();
        const chunk = file.slice(index * chunkSize, (index + 1) * chunkSize);
        sendChunk(url, chunk, index + 1)
          .then(() => sendNext())
          .catch((error) => {
            if (retry <= 8) {
              retry++;
              setTimeout(
                () => {
                  console.log(`Part #${index} failed to upload, retrying (retry ${retry})...`);
                  parts.push({ url, index });
                  sendNext(retry);
                },
                2 ** retry * 2000,
              );
            } else {
              console.log(`Part #${index} failed to upload, giving up`);
              complete(error);
            }
          });
      };

      sendNext();
    }
  } catch (err) {
    let errs = normalizeErrors(err, 'UPLOAD_FAILED');
    dispatch(uploadFailure(errs));
  }
};

// single-threaded upload thunk (for zip files < 100 MB)
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
          originalFile: file.name,
        },
      });
      const signedUrl = uploadUrl.createUpload.url;

      // if overrideSerial is provided by user, call updateBatch to set it
      if (overrideSerial.length) {
        await call({
          request: 'updateBatch',
          projId: selectedProj._id,
          input: {
            _id: uploadUrl.createUpload.batch,
            overrideSerial,
          },
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
    let errs = normalizeErrors(err, 'UPLOAD_FAILED');
    dispatch(uploadFailure(errs));
  }
};

export const fetchBatches =
  (page = 'current') =>
  async (dispatch, getState) => {
    try {
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      if (token) {
        dispatch(fetchBatchesStart());
        const projects = getState().projects.projects;
        const selectedProj = projects.find((proj) => proj.selected);
        const pageInfo = getState().uploads.pageInfo;
        const filter = getState().uploads.filter;

        const batches = await call({
          request: 'getBatches',
          projId: selectedProj._id,
          input: { filter, pageInfo, page },
        });

        dispatch(fetchBatchesSuccess({ batches }));
      }
    } catch (err) {
      const errs = normalizeErrors(err, 'GET_BATCHES_ERROR');
      dispatch(fetchBatchesFailure(errs));
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
        input: { id },
      });

      dispatch(stopBatchSuccess());
      dispatch(fetchBatches());
    }
  } catch (err) {
    dispatch(stopBatchFailure(err));
  }
};

export const redriveBatch = (id) => async (dispatch, getState) => {
  try {
    const currentUser = await Auth.currentAuthenticatedUser();
    const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
    if (token) {
      dispatch(redriveBatchStart({ batch: id }));
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);

      await call({
        request: 'redriveBatch',
        projId: selectedProj._id,
        input: { id },
      });

      dispatch(redriveBatchSuccess());
      dispatch(fetchBatches());
    }
  } catch (err) {
    dispatch(redriveBatchFailure(err));
  }
};

// export errors thunk
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

        if (exportStatus.status === 'Success') {
          dispatch(exportErrorsSuccess(exportStatus));
        } else if (exportStatus.status === 'Error' && exportStatus.error) {
          dispatch(exportErrorsFailure(exportStatus.error));
        } else {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          dispatch(getErrorsExportStatus(documentId));
        }
      }
    } catch (err) {
      dispatch(exportErrorsFailure(err));
    }
  };
};

export const selectBatchStates = (state) => state.uploads.batchStates;
export const selectBatchFilter = (state) => state.uploads.filter;
export const selectBatchPageInfo = (state) => state.uploads.pageInfo;
export const selectUploadsLoading = (state) => state.uploads.loadingStates.upload;
export const selectBatchStatesLoading = (state) => state.uploads.loadingStates.batchStates;
export const selectErrorsExport = (state) => state.uploads.errorsExport;
export const selectErrorsExportLoading = (state) => state.uploads.loadingStates.errorsExport;
export const selectExportImageErrorsErrors = (state) => state.uploads.loadingStates.errorsExport.errors;
export const selectStopBatchLoading = (state) => state.uploads.loadingStates.stopBatch;
export const selectRedriveBatchLoading = (state) => state.uploads.loadingStates.redriveBatch;
export const selectRedriveBatchErrors = (state) => state.uploads.loadingStates.redriveBatch.errors;
export const selectUploadErrors = (state) => state.uploads.loadingStates.upload.errors;

export default uploadSlice.reducer;
