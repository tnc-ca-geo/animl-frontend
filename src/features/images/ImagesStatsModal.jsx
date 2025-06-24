import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config';
import {
  fetchStats,
  fetchTask,
  selectStatsLoading,
  selectImagesStats,
} from '../tasks/tasksSlice.js';
import { selectActiveFilters } from '../filters/filtersSlice.js';
import { SimpleSpinner, SpinnerOverlay } from '../../components/Spinner';
import NoneFoundAlert from '../../components/NoneFoundAlert';
import { indigo } from '@radix-ui/colors';
import InfoIcon from '../../components/InfoIcon';
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  ResponsiveContainer,
} from 'recharts';
import MapView from '../../components/MapView';
import { selectSelectedProject } from '../projects/projectsSlice';

const StatsDash = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  background: '$backgroundDark',
  borderRadius: '5px',
  padding: '10px',
  gap: '10px',
  minWidth: '660px',
});

const hints = {
  reviewedCount:
    'The total number of images that have been reviewed in some way. Note that this does not include ' +
    'images which a user invalidated all labels on all objects, but didn\'t mark it empty. Because multiple users can edit the same image, the sum of all reviewers "Reviewed Counts" very likely will not equal the total number of images "Reviewed".',
  notReviewedCount:
    'The total number of images that either have unlocked objects that still require review or have no objects and have not been marked empty.',
  reviewerList:
    'Each reviewer\'s "Reviewed Count" is the total number of images they have edited in some way (validated/invalidated a label, added objects, etc.). ' +
    'Because multiple users can edit the same image, and because images that have been edited can still be considered "not reviewed" (e.g., if a user invalidated all labels on all objects, but did\'t mark it empty), the sum of all reviewers "Reviewed Counts" very likely will not equal the "Reviewed Count".',
  labelList:
    'The quantities in this chart are of locked objects with validated labels only, so they do not include ML predicted labels that need review.',
  imagesCount: 'Total number of images.',
};

const Content = styled('div', {
  maxWidth: '300px',
  lineHeight: '17px',
});

const Heading = ({ label, content }) => (
  <div style={{ display: 'flex', flexDirection: 'row' }}>
    <label>
      {label}
      <InfoIcon tooltipContent={<Content>{content}</Content>} />
    </label>
  </div>
);

const StatsCard = styled('div', {
  background: '$loContrast',
  padding: '15px',
  border: '1px solid $border',
  borderRadius: '5px',
  width: '100%',
  height: '100%',
  overflowX: 'scroll',
  overflowY: 'scroll',
});

const Container = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
});

const NumerContainer = styled('div', {
  width: '100%',
  marginTop: '15px',
});

const LargeNumber = styled('span', {
  fontSize: '30px',
  fontWeight: '$5',
  color: indigo.indigo11,
  width: '100%',
});

const SmallNumber = styled('div', {
  width: '100%',
  textAlign: 'right',
  alignSelf: 'flex-end',
});

const RatioCard = ({ label, tnum, bnum, content }) => {
  return (
    <StatsCard>
      <Heading content={content} label={label} />
      <Container>
        <NumerContainer>
          <LargeNumber>{tnum.toLocaleString('en-US')}</LargeNumber>
        </NumerContainer>
        {bnum && <SmallNumber>/ {bnum.toLocaleString('en-US')}</SmallNumber>}
      </Container>
    </StatsCard>
  );
};

const Table = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  overflow: 'scroll',
  borderRadius: '5px',
  border: '1px solid $border',
  maxHeight: '300px',
});

const Row = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  maxHeight: '50px',
});

const TableCell = styled('div', {
  borderBottom: '1px solid $border',
  textAlign: 'left',
  minWidth: '200px',
  width: '100%',
  marginRight: '1px',
  padding: '$2',
  overflowX: 'scroll',
});

const ListTableHeader = (list) => (
  <Row>
    {Object.keys(list.list[0]).map((keyName) => (
      <TableCell key={keyName} css={{ background: '$backgroundDark' }}>
        {keyName == 'userId' ? 'User' : keyName === 'reviewedCount' ? 'Reviewed Count' : keyName}
      </TableCell>
    ))}
  </Row>
);

const ListCard = ({ label, list, content }) => (
  <StatsCard>
    <Heading content={content} label={label} />
    <Table>
      {list && <ListTableHeader list={list} />}
      {list.map((stat, index) => (
        <Row key={index}>
          {Object.keys(stat).map((keyName, i) => (
            <TableCell key={i}>{stat[keyName].toLocaleString('en-US')}</TableCell>
          ))}
        </Row>
      ))}
    </Table>
  </StatsCard>
);

const GraphCard = ({ label, list, content }) => {
  let width = 0;
  const data = [];

  for (const [objkey, objval] of Object.entries(list)) {
    data.push({ name: objkey, 'Total Labels': objval });
    width = Math.max(width, objkey.length);
  }

  data.sort(function (a, b) {
    return b['Total Labels'] - a['Total Labels'];
  });

  width = (width - 6) * 9 + 60;

  return (
    <StatsCard>
      <Heading content={content} label={label} />
      <ResponsiveContainer
        width="100%"
        height={250 + (data.length > 12 ? (data.length - 12) * 20 : 0)}
      >
        <BarChart layout="vertical" data={data}>
          <CartesianGrid stroke="#f5f5f5" />
          <XAxis
            type="number"
            allowDecimals={false}
            tickFormatter={(tick) => tick.toLocaleString('en-US')}
          />
          <YAxis width={width} dataKey="name" type="category" scale="auto" interval={0} />
          <Tooltip />
          <Legend />
          <Bar dataKey="Total Labels" fill={indigo.indigo11} />
        </BarChart>
      </ResponsiveContainer>
    </StatsCard>
  );
};

const ImagesStatsModal = ({ open }) => {
  const dispatch = useDispatch();
  const filters = useSelector(selectActiveFilters);
  const selectedProject = useSelector(selectSelectedProject);

  // fetch images stats
  const stats = useSelector(selectImagesStats);
  const imagesStatsLoading = useSelector(selectStatsLoading);
  const [deploymentLocations, setDeploymentLocations] = useState([]);

  useEffect(() => {
    const { isLoading, errors, noneFound } = imagesStatsLoading;
    const noErrors = !errors || errors.length === 0;
    if (open && stats === null && !noneFound && !isLoading && noErrors) {
      dispatch(fetchStats(filters));
    }
  }, [open, stats, imagesStatsLoading, filters, dispatch]);

  useEffect(() => {
    const getStatsPending = imagesStatsLoading.isLoading && imagesStatsLoading.taskId;
    if (getStatsPending) {
      dispatch(fetchTask(imagesStatsLoading.taskId));
    }
  }, [imagesStatsLoading, dispatch]);

  useEffect(() => {
    const camDeploymentLocations = selectedProject.cameraConfigs.reduce((acc, config) => {
      const camDeployment = config.deployments
      .filter((dep) => dep.location) // filter for camera deployments where location is not null
      .map((dep) => ({
        id: config._id,
        location: dep.location,
        deploymentId: dep._id
      }));
      return acc.concat(camDeployment)
    }, [])

    setDeploymentLocations(camDeploymentLocations);
  }, [selectedProject, setDeploymentLocations])
 
  return (
    <div>
      {imagesStatsLoading.isLoading && (
        <SpinnerOverlay>
          <SimpleSpinner />
        </SpinnerOverlay>
      )}
      {imagesStatsLoading.noneFound && (
        <NoneFoundAlert>
          We couldn&apos;t find any images that matched this set of filters.
        </NoneFoundAlert>
      )}
      {stats && (
        <StatsDash>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
            <RatioCard label="Images" tnum={stats.imageCount} content={hints.imagesCount} />
            <RatioCard
              label="Reviewed"
              tnum={stats.reviewedCount.reviewed}
              // bnum={stats.imageCount}
              content={hints.reviewedCount}
            />
            <RatioCard
              label="Not reviewed"
              tnum={stats.reviewedCount.notReviewed}
              // bnum={stats.imageCount}
              content={hints.notReviewedCount}
            />
          </div>
          {stats['labelList'] && Object.keys(stats['labelList']).length !== 0 && (
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
              <GraphCard
                label="Validated labels"
                list={stats.labelList}
                content={hints.labelList}
              />
            </div>
          )}
          {stats['reviewerList'].length !== 0 && (
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
              <ListCard label="Reviewers" list={stats.reviewerList} content={hints.reviewerList} />
            </div>
          )}
          <MapView coordinates={deploymentLocations?.map((dep) => dep.location.geometry.coordinates) || []} />
        </StatsDash>
      )}
    </div>
  );
};
export default ImagesStatsModal;
