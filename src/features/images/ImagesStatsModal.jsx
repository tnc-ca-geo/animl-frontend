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
import {SelectedCount} from '../../components/Accordion.jsx';
import { indigo } from '@radix-ui/colors';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
const StatsDash = styled('div', {
  border: '1px solid $border',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gridTemplateRows: '1fr 1fr 1fr',
  background: '$backgroundDark',
  borderRadius: '5px',
  padding: '10px',
  gap: '10px'
});
const Label = styled('div', {
  marginBottom: '20px'
})
let mappings = {};
mappings = {imageCount: "Image Count", reviewedCount: "Reviewed Count",
  reviewerList: "Reviewer List", notReviewed: "Not Reviewed", labelList: "Label List",
  multiReviewerCount: "Multi Reviewer Count", userId: "User", reviewed: "Reviewed"};

function mapLabel(s) {
  return (mappings[s] == undefined) ? (s + ":") : mappings[s];
}

function changeCard(color, row, col, cspan, rspan) {
  const StatsCard = styled('div', {
    background: color,
    padding: '15px',
    borderRadius: '5px',
    width: '100%',
    height: '100%',
    overflowX: 'scroll',
    overflowY: 'scroll',
    gridColumn: col + " / span " + cspan,
    gridRow: row + " / span " + rspan,
  });
  return StatsCard;
}


const StatsItem = ({name, stat}) => {
  switch (name) {
    case "imageCount": {
      return (
        <RatioCard label={mapLabel(name)} tnum={stat} bnum={null} col={1} row={2} rspan={1} cspan={1}></RatioCard>
      );
    }
    case "reviewedCount": {
      return (
        <RatioCard label={mapLabel(name)} tnum={stat['reviewed']} bnum={stat['notReviewed']}
        col={1} row={1} span={1} rspan={1} cspan={1}></RatioCard>
      );
    }
    case "reviewerList": {
      return (
        <ListCard label={mapLabel(name)} list={stat} col={1} row={3} rspan={1} cspan={2}></ListCard>
      );
    }
    case "labelList": {
      return (
        <GraphCard label={mapLabel(name)} list={stat} col={2} row={1} rspan={2} cspan={2}></GraphCard>
      );
    }
    case "multiReviewerCount": {
      return (
        <RatioCard label={mapLabel(name)} tnum={stat} bnum={null} col={3} row={3} rspan={1} cspan={1}></RatioCard>
      );
    }
  }
  return (
    <StyledStatsDisclaimer>
      There is nothing to display for the statistic: {name}
    </StyledStatsDisclaimer>
  );
};

const StyledStatsDisclaimer = styled('div', {
  paddingTop: 10,
  fontSize: '$3',
  color: '$textMedium',
});


const StatsDisclaimer = () => (
  <StyledStatsDisclaimer>
    NOTE: this is a WIP. Be mindful of the following:
    <ul>
      <li>
        each reviewer&apos;s &quot;Reviewed Count&quot; is the total number of <em>images</em> they
        have edited in some way (validated/invalidated a label, added objects, etc.). Because
        multiple users can edit the same image, and because images that have been edited can still
        be considered &quot;not reviewed&quot; (e.g., if a user invalidated all labels on all
        objects, but did&apos;t mark it empty), the sum of all reviewers &quot;Reviewed Counts&quot;
        very likely will not equal the &quot;Reviewed Count&quot; &quot;reviewed&quot; quantity
        each reviewer&apos;s &quot;Reviewed Count&quot; is the total number of <em>images</em> they
        have edited in some way (validated/invalidated a label, added objects, etc.). Because
        multiple users can edit the same image, and because images that have been edited can still
        be considered &quot;not reviewed&quot; (e.g., if a user invalidated all labels on all
        objects, but did&apos;t mark it empty), the sum of all reviewers &quot;Reviewed Counts&quot;
        very likely will not equal the &quot;Reviewed Count&quot; &quot;reviewed&quot; quantity
      </li>
      <li>
        the quantities in the &quot;Label List&quot; are for locked objects with <em>validated</em>{' '}
        labels only, so they do not include ML predicted labels that need review
        the quantities in the &quot;Label List&quot; are for locked objects with <em>validated</em>{' '}
        labels only, so they do not include ML predicted labels that need review
      </li>
    </ul>
  </StyledStatsDisclaimer>
);

const RatioCard = ({label, tnum, bnum, row, col, cspan, rspan}) => {
  const StatsCard = changeCard('white', row, col, cspan, rspan)
  const Container = styled('div', {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  })
  const NumerContainer = styled('div', {
    width: '100%',
  })
  const LargeNumber = styled(SelectedCount, {
    fontSize: '30px',
    width: '100%',
    marginLeft: '5px',
    
  })
  const SmallNumber = styled('div', {
    width: '100%',
    textAlign: 'right',
    alignSelf: 'flex-end'
  })
  
  return (
    <StatsCard>
      <Label>{label}</Label>
      <Container>
        <NumerContainer>
          <LargeNumber>{tnum}</LargeNumber>
        </NumerContainer>
        {bnum !== null && 
        <SmallNumber>/ {bnum}</SmallNumber>}
      </Container>
    </StatsCard>
  );
}

const ListCard = ({label, list, row, col, cspan, rspan}) => {
  const StatsCard = changeCard('white', row, col, cspan, rspan)
  const Table = styled('div', {
    maxWidth: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'scroll',
    borderRadius: '5px',
    border: '1px solid $border',
    maxHeight: '102px'
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
    marginRight: '1px',
    padding: '$2',
    overflowX: 'scroll'
  });
  const Header = () => {
    let headers = list[0]
    return(
       <Row>
        {Object.keys(headers).map((keyName, i) => (
            <TableCell key={i} css={{background: '$backgroundDark'}}>{mapLabel(keyName)}</TableCell>
          ))
          } 
        </Row>
    );
  }
  return (
    <StatsCard>
      <Label>{label}</Label>
       <Table>
       <Header/>
        {list.map((stat, index) => (
          <Row key={index}>
            {Object.keys(stat).map((keyName, i) => (
                <TableCell key={i}>{stat[keyName]}</TableCell>
              ))
            } 
          </Row>
        ))}
       </Table>
    </StatsCard>
  );
}

const GraphCard = ({label, list, row, col, cspan, rspan}) => {
  const StatsCard = changeCard('white', row, col, cspan, rspan)
  const data = []
  for (const [objkey, objval] of Object.entries(list)) {
    data.push({"name": objkey, "Total Labels": objval})
  }
  return (
    <StatsCard>
      <Label>{label}</Label>
        <ComposedChart
          layout="vertical"
          width={350}
          height= {200}
          data={data}
        >
          <CartesianGrid stroke="#f5f5f5" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" scale="band" />
          <Tooltip />
          <Legend />
          <Bar dataKey="Total Labels" barSize={20} fill={indigo.indigo11} />
        </ComposedChart>
    </StatsCard>
    
  );
}

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
        <div>
           <StatsDash>
              {Object.keys(stats).map((keyName, i) => (
                <StatsItem key={i} name={keyName} stat={stats[keyName]}></StatsItem>
                ))
              }
          </StatsDash>
           <StatsDisclaimer/>
        </div>
      )}
    </div>
  );
};
export default ImagesStatsModal;

