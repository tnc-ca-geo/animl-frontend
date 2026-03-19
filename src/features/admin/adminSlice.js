import { createSlice } from '@reduxjs/toolkit';
import { Auth } from 'aws-amplify';
import { call } from '../../api';

const initialState = {
  latestSnapshot: null,
  history: [],
  historyRange: {
    start: null,
    end: null,
  },
  loadingStates: {
    fetchLatest: {
      isLoading: false,
      errors: null,
    },
    fetchHistory: {
      isLoading: false,
      errors: null,
    },
  },
};

export const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    fetchLatestStart: (state) => {
      state.loadingStates.fetchLatest.isLoading = true;
      state.loadingStates.fetchLatest.errors = null;
    },
    fetchLatestSuccess: (state, { payload }) => {
      state.latestSnapshot = payload;
      state.loadingStates.fetchLatest.isLoading = false;
    },
    fetchLatestFailure: (state, { payload }) => {
      state.loadingStates.fetchLatest.isLoading = false;
      state.loadingStates.fetchLatest.errors = payload;
    },
    fetchHistoryStart: (state) => {
      state.loadingStates.fetchHistory.isLoading = true;
      state.loadingStates.fetchHistory.errors = null;
    },
    fetchHistorySuccess: (state, { payload }) => {
      state.history = payload;
      state.loadingStates.fetchHistory.isLoading = false;
    },
    fetchHistoryFailure: (state, { payload }) => {
      state.loadingStates.fetchHistory.isLoading = false;
      state.loadingStates.fetchHistory.errors = payload;
    },
    setHistoryRange: (state, { payload }) => {
      state.historyRange = payload;
    },
  },
});

export const {
  fetchLatestStart,
  fetchLatestSuccess,
  fetchLatestFailure,
  fetchHistoryStart,
  fetchHistorySuccess,
  fetchHistoryFailure,
  setHistoryRange,
} = adminSlice.actions;

// Thunks
export const fetchPlatformStats = () => async (dispatch) => {
  try {
    await Auth.currentAuthenticatedUser();
    dispatch(fetchLatestStart());
    const res = await call({ request: 'getPlatformStats' });
    dispatch(fetchLatestSuccess(res.platformStats));
  } catch (err) {
    console.error('Error fetching platform stats:', err);
    dispatch(fetchLatestFailure(err));
  }
};

export const fetchPlatformStatsHistory =
  ({ start, end }) =>
  async (dispatch) => {
    try {
      await Auth.currentAuthenticatedUser();
      dispatch(fetchHistoryStart());
      dispatch(setHistoryRange({ start, end }));
      const res = await call({ request: 'getPlatformStatsHistory', input: { start, end } });
      dispatch(fetchHistorySuccess(res.platformStatsHistory));
    } catch (err) {
      console.error('Error fetching platform stats history:', err);
      dispatch(fetchHistoryFailure(err));
    }
  };

// Selectors
export const selectLatestSnapshot = (state) => state.admin.latestSnapshot;
export const selectHistory = (state) => state.admin.history;
export const selectHistoryRange = (state) => state.admin.historyRange;
export const selectLatestSnapshotLoading = (state) => state.admin.loadingStates.fetchLatest;
export const selectHistoryLoading = (state) => state.admin.loadingStates.fetchHistory;

export default adminSlice.reducer;
