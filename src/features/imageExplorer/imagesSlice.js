import { createSlice } from '@reduxjs/toolkit';
import { getCameras } from '../../api/animlAPI';

const imagesInitialState = {
  filters: {
    cameras: {},
  },
  images: [],
  isLoading: false,
  error: null
};

function startLoading(state) {
  state.isLoading = true
};

function loadingFailed(state, action) {
  state.isLoading = false
  state.error = action.payload
};

export const imagesSlice = createSlice({
  name: 'images',
  initialState: imagesInitialState,
  reducers: {
    getImagesStart: startLoading,
    getImagesSuccess(state, { payload }) {
      // const { pageCount, issues, pageLinks } = payload
      // state.pageCount = pageCount
      // state.pageLinks = pageLinks
      // state.isLoading = false
      // state.error = null

      // issues.forEach(issue => {
      //   state.issuesByNumber[issue.number] = issue
      // })

      // state.currentPageIssues = issues.map(issue => issue.number)
    },
    getImagesFailure: loadingFailed,
    getCamerasStart: startLoading,
    getCamerasSuccess: (state, { payload }) => {
      console.log('Updating state with new available cameras: ', payload);
      state.isLoading = false;
      payload.cameras.forEach((camera) => {
        if (!(camera._id in state.filters.cameras)) {
          state.filters.cameras[camera._id] = { selected: false };
        }
      });
    },
    getCamerasFailure: loadingFailed,
    cameraToggled: (state, { payload }) => {
      console.log('Camera toggled: ', payload);
      const camera = state.filters.cameras[payload];
      camera.selected = !camera.selected;
    }
  },
});

export const {
  getImagesStart,
  getImagesSuccess,
  getImagesFailure,
  getCamerasStart,
  getCamerasSuccess,
  getCamerasFailure,
  cameraToggled,
} = imagesSlice.actions;

// export const fetchImages = filters => async dispatch => {
//   try {
//     dispatch(getImagesStart());
//     const images = await getImages(filters);
//     dispatch(getImagesSuccess(images))
//   } catch (err) {
//     dispatch(getImagesFailure(err.toString()))
//   }
// };

export const fetchCameras = () => async dispatch => {
  try {
    dispatch(getCamerasStart());
    const cameras = await getCameras();
    dispatch(getCamerasSuccess(cameras))
  } catch (err) {
    dispatch(getCamerasFailure(err.toString()))
  }
};

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
// You can also use Reselect's createSelector to create memoized selector funcs:
// https://redux-toolkit.js.org/tutorials/intermediate-tutorial#optimizing-todo-filtering
export const selectCameras = state => state.images.filters.cameras;

export default imagesSlice.reducer;
