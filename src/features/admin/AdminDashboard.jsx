import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import {
  fetchPlatformStats,
  fetchPlatformStatsHistory,
  selectLatestSnapshotLoading,
  selectHistoryLoading,
  selectAdminFilter,
  selectHistoryRange,
  selectLatestSnapshot,
} from './adminSlice';
import KPISummary from './KPISummary';
import GrowthTrends from './GrowthTrends';
import ProjectTable from './ProjectTable';
import DashboardFilters from './DashboardFilters';
import { SimpleSpinner } from '../../components/Spinner';
import Callout from '../../components/Callout';

const DashboardContainer = styled('div', {
  width: '100%',
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '$4',
  '@bp1': {
    padding: '$4 $5',
  },
});

const DashboardHeader = styled('div', {
  marginBottom: '$4',
});

const Title = styled('h1', {
  fontSize: '$7',
  fontWeight: '$5',
  color: '$textDark',
  margin: '0 0 $1 0',
});

const Subtitle = styled('p', {
  fontSize: '$4',
  fontWeight: '$2',
  color: '$textMedium',
});

const SpinnerWrapper = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '$8 0',
});

const DEFAULT_HISTORY_DAYS = 180; // 6 months

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const latestLoading = useSelector(selectLatestSnapshotLoading);
  const historyLoading = useSelector(selectHistoryLoading);
  const filter = useSelector(selectAdminFilter);
  const historyRange = useSelector(selectHistoryRange);
  const isInitialMount = useRef(true);
  const snapshot = useSelector(selectLatestSnapshot);

  // Initial fetch on mount with default filter
  useEffect(() => {
    const end = new Date().toISOString();
    const start = new Date(Date.now() - DEFAULT_HISTORY_DAYS * 24 * 60 * 60 * 1000).toISOString();
    dispatch(fetchPlatformStats(filter));
    dispatch(fetchPlatformStatsHistory({ start, end, filter }));
  }, [dispatch]);

  // Re-fetch when filter changes (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    dispatch(fetchPlatformStats(filter));
    const start =
      historyRange.start ||
      new Date(Date.now() - DEFAULT_HISTORY_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const end = historyRange.end || new Date().toISOString();
    dispatch(fetchPlatformStatsHistory({ start, end, filter }));
  }, [filter]);

  const isLoading = latestLoading.isLoading || historyLoading.isLoading;
  const errors = latestLoading.errors || historyLoading.errors;

  return (
    <DashboardContainer>
      <DashboardHeader>
        <Title>Admin Dashboard</Title>
        <Subtitle>
          <span style={{ fontWeight: '600' }}>Last updated:</span>{' '}
          {snapshot ? new Date(snapshot.snapshotDate).toLocaleString() : 'N/A'}
        </Subtitle>
      </DashboardHeader>
      <DashboardFilters />
      {errors && (
        <Callout type="error" title="Failed to load platform stats">
          <p>
            {typeof errors === 'string'
              ? errors
              : 'An error occurred while fetching platform statistics. Please try again.'}
          </p>
        </Callout>
      )}
      {isLoading && !errors ? (
        <SpinnerWrapper>
          <SimpleSpinner />
        </SpinnerWrapper>
      ) : (
        <>
          <KPISummary />
          <GrowthTrends />
          <ProjectTable />
        </>
      )}
    </DashboardContainer>
  );
};

export default AdminDashboard;
