import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import {
  fetchPlatformStats,
  fetchPlatformStatsHistory,
  selectLatestSnapshotLoading,
  selectHistoryLoading,
} from './adminSlice';
import KPISummary from './KPISummary';
import GrowthTrends from './GrowthTrends';
import ProjectTable from './ProjectTable';
import { PulseSpinner } from '../../components/Spinner';
import Callout from '../../components/Callout';

const DashboardContainer = styled('div', {
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

  useEffect(() => {
    dispatch(fetchPlatformStats());
    const end = new Date().toISOString();
    const start = new Date(Date.now() - DEFAULT_HISTORY_DAYS * 24 * 60 * 60 * 1000).toISOString();
    dispatch(fetchPlatformStatsHistory({ start, end }));
  }, [dispatch]);

  const isLoading = latestLoading.isLoading || historyLoading.isLoading;
  const errors = latestLoading.errors || historyLoading.errors;

  return (
    <DashboardContainer>
      <DashboardHeader>
        <Title>Admin Dashboard</Title>
      </DashboardHeader>
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
          <PulseSpinner />
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
