import { createSlice, createSelector } from '@reduxjs/toolkit';
import { call } from '../../api';

import { Auth } from 'aws-amplify';

const initialState = {
  views: [],  // TODO: make object w/ _ids as keys?
  models: [], // TODO: make object w/ _ids as keys?
  unsavedChanges: false,
  isLoading: false,
  error: null,
};

export const viewsSlice = createSlice({
  name: 'views',
  initialState,
  reducers: {

    getViewsStart: (state) => { state.isLoading = true; },

    getViewsFailure: (state, { payload }) => {
      state.isLoading = false;
      state.error = payload;
    },

    getViewsSuccess: (state, { payload }) => {
      state.isLoading = false;
      state.error = null;
      const viewsInState = state.views.map((view) => view._id);
      payload.views.forEach((view) => {
        if (!viewsInState.includes(view._id)) {
          view.selected = view.name === 'All images';
          state.views.push(view);
        }
      });
    },

    editViewStart: (state) => { state.isLoading = true; },

    editViewFailure: (state, { payload }) => {
      state.isLoading = false;
      state.error = payload;
    },

    saveViewSuccess: (state, { payload }) => {
      state.isLoading = false;
      state.error = null;
      let viewInState = false;
      state.views.forEach((view, i) => {
        if (view._id === payload._id) {
          viewInState = true;
          state.views[i] = {
            ...state.views[i],
            ...payload
          };
        }
      });
      if (!viewInState) {
        state.views.push(payload);
      }
    },

    deleteViewSuccess: (state, { payload }) => {
      state.isLoading = false;
      state.error = null;
      state.views = state.views.filter((view) => {
        return view._id !== payload;
      });
    },

    setSelectedView: (state, { payload }) => {
      if (payload.dirty) {
        console.log('selected view changed: ', payload);
        state.views.forEach((view) => {
          view.selected = view._id === payload.view._id;
        });
      }
    },

    setUnsavedChanges: (state, { payload }) => {
      state.unsavedChanges = payload;
    },

    getModelsSuccess: (state, { payload }) => {
      state.isLoading = false;
      state.error = null;
      let modelEntities = {};
      payload.models.forEach((model) => {
        modelEntities[model._id] = model;
      });
      state.models = modelEntities;
    },


  },
});

// export actions from slice
export const {
  getViewsStart,
  getViewsSuccess,
  getViewsFailure,
  editViewStart,
  saveViewSuccess,
  deleteViewSuccess,
  editViewFailure,
  setSelectedView,
  setUnsavedChanges,
  getModelsSuccess
} = viewsSlice.actions;

// TODO: maybe use createAsyncThunk for these? 
// https://redux-toolkit.js.org/api/createAsyncThunk

// fetchViews thunk
export const fetchViews = () => async dispatch => {
  try {
    
    const currentUser = await Auth.currentAuthenticatedUser();
    const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
   
    if(token){
      dispatch(getViewsStart());  
      console.log("Trying to get views");
      const views = await call('getViews');
      dispatch(getViewsSuccess(views));
    }
  } catch (err) {
    dispatch(getViewsFailure(err.toString()))
  }
};

// editView thunk
// TODO: maybe break this up into discrete thunks?
export const editView = (operation, payload) =>
  async (dispatch, getState) => {
    try {
      dispatch(editViewStart());
      switch (operation) {
        case 'create': {
          const res = await call('createView', payload);
          const view = res.createView.view;
          dispatch(saveViewSuccess(view));
          dispatch(setSelectedView({ view }));
          break;
        }
        case 'update': {
          const res = await call('updateView', payload);
          const view = res.updateView.view;
          dispatch(saveViewSuccess(view));
          dispatch(setSelectedView({ view }));
          break;
        }
        case 'delete': {
          const res = await call('deleteView', payload);
          const deletedViewId = res.deleteView.viewId;
          const views = getState().views.views;
          const defaultView = views.filter((view) => {
            return view.name === 'All images';
          })[0];
          dispatch(setSelectedView({ view: defaultView })); 
          dispatch(deleteViewSuccess(deletedViewId));
          break;
        }
        default: {
          const err = 'An peration (create, update, or delete) is required';
          throw new Error(err);
        }
      }
    } catch (err) {
      console.log(`error attempting to ${operation} view: ${err.toString()}`);
      dispatch(editViewFailure(err.toString()));
    }
};

// fetchModels thunk
export const fetchModels = () => async dispatch => {
  try {

    
    const currentUser = await Auth.currentAuthenticatedUser();
    const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
    if(token){
      dispatch(getViewsStart());
      const models = await call('getModels');
      dispatch(getModelsSuccess(models));
    }
  } catch (err) {
    dispatch(getViewsFailure(err.toString()))
  }
};

// Selectors
export const selectViewsLoading = state => state.views.isLoading;
export const selectViews = state => state.views;
export const selectSelectedView = createSelector(
  [selectViews],
  (views) => views.views.filter((view) => view.selected)[0]
);
export const selectUnsavedViewChanges = state => (
  state.views.unsavedChanges
);
export const selectModels = createSelector(
  [selectViews],
  (views) => Object.values(views.models)
);

export default viewsSlice.reducer;
