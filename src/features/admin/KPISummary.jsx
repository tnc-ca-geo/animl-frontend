import React from 'react';
import { useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { selectLatestSnapshot } from './adminSlice';

const Grid = styled('div', {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '$3',
  marginBottom: '$4',
});

const Card = styled('div', {
  background: '$loContrast',
  border: '1px solid $border',
  borderRadius: '$2',
  padding: '$3 $4',
  display: 'flex',
  flexDirection: 'column',
  gap: '$1',
});

const CardLabel = styled('span', {
  fontSize: '$3',
  fontWeight: '$3',
  color: '$textMedium',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
});

const CardValue = styled('span', {
  fontSize: '$7',
  fontWeight: '$5',
  color: '$textDark',
  lineHeight: '1.1',
});

const SubStat = styled('div', {
  fontSize: '$2',
  color: '$textLight',
  marginTop: '$1',
  display: 'flex',
  gap: '$2',
});

const SubStatItem = styled('span', {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
});

const Dot = styled('span', {
  display: 'inline-block',
  width: '8px',
  height: '8px',
  borderRadius: '$round',
  variants: {
    color: {
      green: { backgroundColor: '$successBase' },
      orange: { backgroundColor: '$warningBase' },
      blue: { backgroundColor: '$infoBase' },
    },
  },
});

const formatNumber = (n) => {
  if (n == null) return '—';
  return n.toLocaleString('en-US');
};

const KPISummary = () => {
  const snapshot = useSelector(selectLatestSnapshot);

  if (!snapshot) return null;

  const { platform } = snapshot;

  return (
    <Grid>
      <Card>
        <CardLabel>Total Projects</CardLabel>
        <CardValue>{formatNumber(platform.totalProjects)}</CardValue>
      </Card>
      <Card>
        <CardLabel>Total Images</CardLabel>
        <CardValue>{formatNumber(platform.totalImages)}</CardValue>
        <SubStat>
          <SubStatItem>
            <Dot color="green" />
            {formatNumber(platform.totalImagesReviewed)} reviewed
          </SubStatItem>
          <SubStatItem>
            <Dot color="orange" />
            {formatNumber(platform.totalImagesNotReviewed)} pending
          </SubStatItem>
        </SubStat>
      </Card>
      <Card>
        <CardLabel>Total Users</CardLabel>
        <CardValue>{formatNumber(platform.totalUsers)}</CardValue>
      </Card>
      <Card>
        <CardLabel>Total Cameras</CardLabel>
        <CardValue>{formatNumber(platform.totalCameras)}</CardValue>
        <SubStat>
          <SubStatItem>
            <Dot color="blue" />
            {formatNumber(platform.totalWirelessCameras)} wireless
          </SubStatItem>
        </SubStat>
      </Card>
    </Grid>
  );
};

export default KPISummary;
