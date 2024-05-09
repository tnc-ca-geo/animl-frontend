import React, { useEffect } from 'react';
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
import { SelectedCount } from '../../components/Accordion.jsx';
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

const StatsDash = styled('div', {
  border: '1px solid $border',
  display: 'flex',
  flexDirection: 'column',
  background: '$backgroundDark',
  borderRadius: '5px',
  padding: '10px',
  gap: '10px',
  minWidth: '660px',
});

const reviewedCount =
  'The total number of images that are edited in some way. Note that this does not include ' +
  'images which a user invalidated all labels on all objects, but didn\'t mark it empty. Because multiple users can edit the same image, the sum of all reviewers "Reviewed Counts" very likely will not equal the "Reviewed Count".';

const reviewerList =
  'Each reviewer\'s "Reviewed Count" is the total number of images they have edited in some way (validated/invalidated a label, added objects, etc.). ' +
  'Because multiple users can edit the same image, and because images that have been edited can still be considered "not reviewed" (e.g., if a user invalidated all labels on all objects, but did\'t mark it empty), the sum of all reviewers "Reviewed Counts" very likely will not equal the "Reviewed Count".';

const labelList =
  'The quantities in the "Label List" are for locked objects with validated labels only, so they do not include ML predicted labels that need review.';

const multiReviewerCount = 'Total number of images with multiple reviewers.';
const imagesCount = 'Total number of images. test';

const Heading = ({ label, content }) => {
  const Content = styled('div', {
    maxWidth: '300px',
    lineHeight: '17px',
  });
  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <label>
        {label}
        <InfoIcon tooltipContent={<Content>{content}</Content>} />
      </label>
    </div>
  );
};

const mappings = {
  imageCount: 'Image Count',
  reviewedCount: 'Reviewed Count',
  reviewerList: 'Reviewer List',
  notReviewed: 'Not Reviewed',
  labelList: 'Label List',
  multiReviewerCount: 'Multi Reviewer Count',
  userId: 'User',
  reviewed: 'Reviewed',
};

function mapLabel(s) {
  return mappings[s] == undefined ? s + ':' : mappings[s];
}

const StatsCard = styled('div', {
  background: '$loContrast',
  padding: '15px',
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
const LargeNumber = styled(SelectedCount, {
  fontSize: '30px',
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
          <LargeNumber>{tnum}</LargeNumber>
        </NumerContainer>
        {bnum && <SmallNumber>/ {bnum}</SmallNumber>}
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
  maxHeight: '102px',
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

const ListCard = ({ label, list, content }) => {
  const Header = () => {
    let headers = list[0];
    return (
      <Row>
        {Object.keys(headers).map((keyName, i) => (
          <TableCell key={i} css={{ background: '$backgroundDark' }}>
            {mapLabel(keyName)}
          </TableCell>
        ))}
      </Row>
    );
  };
  return (
    <StatsCard>
      <Heading content={content} label={label} />
      <Table>
        <Header />
        {list.map((stat, index) => (
          <Row key={index}>
            {Object.keys(stat).map((keyName, i) => (
              <TableCell key={i}>{stat[keyName]}</TableCell>
            ))}
          </Row>
        ))}
      </Table>
    </StatsCard>
  );
};

const GraphCard = ({ label, list, content }) => {
  let width = 0;
  const data = [];
  for (const [objkey, objval] of Object.entries(list)) {
    data.push({ name: objkey, 'Total Labels': objval });
    width = Math.max(width, objkey.length);
  }
  width = (width - 6) * 9 + 60;
  data.sort(function (a, b) {
    return b['Total Labels'] - a['Total Labels'];
  });
  function GetHeight() {
    return 250 + (data.length > 12 ? (data.length - 12) * 20 : 0);
  }

  return (
    <StatsCard>
      <Heading content={content} label={label} />
      <div style={{ overflowY: 'scroll', overflowX: 'scroll' }}>
        <ResponsiveContainer width="100%" height={GetHeight()}>
          <BarChart layout="vertical" data={data}>
            <CartesianGrid stroke="#f5f5f5" />
            <XAxis type="number" allowDecimals={false} />
            <YAxis width={width} dataKey="name" type="category" scale="auto" interval={0} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Total Labels" fill={indigo.indigo11} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </StatsCard>
  );
};

const ImagesStatsModal = ({ open }) => {
  const dispatch = useDispatch();
  const filters = useSelector(selectActiveFilters);

  // fetch images stats
  const stats = useSelector(selectImagesStats);
  const imagesStatsLoading = useSelector(selectStatsLoading);
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
            <RatioCard label={'imageCount'} tnum={stats.imageCount} content={imagesCount} />
            <RatioCard
              label={mapLabel('reviewedCount')}
              tnum={stats.reviewedCount.reviewed}
              bnum={stats.reviewedCount.notReviewed}
              content={reviewedCount}
            />
            <RatioCard
              label={mapLabel('multiReviewerCount')}
              tnum={stats.multiReviewerCount}
              content={multiReviewerCount}
            />
          </div>
          {Object.keys(stats['labelList']).length !== 0 && (
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
              <GraphCard label={mapLabel('labelList')} list={stats.labelList} content={labelList} />
            </div>
          )}
          {stats['reviewerList'].length !== 0 && (
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
              <ListCard
                label={mapLabel('reviewerList')}
                list={stats.reviewerList}
                content={reviewerList}
              ></ListCard>
            </div>
          )}
        </StatsDash>
      )}
    </div>
  );
};
export default ImagesStatsModal;
