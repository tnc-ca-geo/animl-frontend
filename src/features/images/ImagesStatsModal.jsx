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
import InfoIcon from '../../components/InfoIcon';
import Warning from '../../components/Warning';
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  ResponsiveContainer
} from 'recharts';

const StatsDash = styled('div', {
  border: '1px solid $border',
  display: 'flex',
  flexDirection: 'column',
  background: '$backgroundDark',
  borderRadius: '5px',
  padding: '10px',
  gap: '10px',
  minWidth: '660px'
});

let reviewedCount = "The total number of images that are edited in some way. Note that this does not include " +
"images which a user invalidated all labels on all objects, but didn't mark it empty. Because multiple users can edit the same image, the sum of all reviewers \"Reviewed Counts\" very likely will not equal the \"Reviewed Count\"."

let reviewerList = "Each reviewer's \"Reviewed Count\" is the total number of images they have edited in some way (validated/invalidated a label, added objects, etc.). "+
"Because multiple users can edit the same image, and because images that have been edited can still be considered \"not reviewed\" (e.g., if a user invalidated all labels on all objects, but did't mark it empty), the sum of all reviewers \"Reviewed Counts\" very likely will not equal the \"Reviewed Count\"."

let labelList= "The quantities in the \"Label List\" are for locked objects with validated labels only, so they do not include ML predicted labels that need review."

let multiReviewerCount = "Total number of images with multiple reviewers."
let imagesCount= "Total number of images."


const Heading = ({label, content}) => {
  const Content = styled('div', {
    maxWidth: '300px',
    lineHeight: '17px'
  });
  return(
    <div style={{display:"flex", flexDirection:"row"}}>
       <label >{label}
         <InfoIcon tooltipContent={<Content>{content}</Content>} />
       </label>
    </div>
  )
}

let mappings = {};
mappings = {imageCount: "Image Count", reviewedCount: "Reviewed Count",
  reviewerList: "Reviewer List", notReviewed: "Not Reviewed", labelList: "Label List",
  multiReviewerCount: "Multi Reviewer Count", userId: "User", reviewed: "Reviewed"};

function mapLabel(s) {
  return (mappings[s] == undefined) ? (s + ":") : mappings[s];
}

function changeCard(color) {
  const StatsCard = styled('div', {
    background: color,
    padding: '15px',
    borderRadius: '5px',
    width: '100%',
    height: '100%',
    overflowX: 'scroll',
    overflowY: 'scroll'
  });
  return StatsCard;
}

const StatsItem = ({name, stat}) => {
  switch (name) {
    case "imageCount": {
      return (
        <RatioCard label={mapLabel(name)} tnum={stat} bnum={null} content={imagesCount}></RatioCard>
      );
    }
    case "reviewedCount": {
      return (
        <RatioCard label={mapLabel(name)} tnum={stat['reviewed']} bnum={stat['notReviewed']}
        content={reviewedCount}></RatioCard>
      );
    }
    case "reviewerList": {
      stat = []
      if (stat.length === 0) {
        break;
      }
      return (
        <ListCard label={mapLabel(name)} list={stat} content={reviewerList}></ListCard>
      );
    }
    case "labelList": {
      if (Object.keys(stat).length === 0) {
        break;
      }
      return (
        <GraphCard label={mapLabel(name)} list={stat} content={labelList}></GraphCard>
      );
    }
    case "multiReviewerCount": {
      return (
        <RatioCard label={mapLabel(name)} tnum={stat} bnum={null} content={multiReviewerCount}></RatioCard>
      );
    }
  }
  return (
    <Warning>
      Error: There is nothing to display for the statistic &quot;{name}&quot;
    </Warning>
  );
};

const RatioCard = ({label, tnum, bnum, content}) => {
  const StatsCard = changeCard('white')
  const Container = styled('div', {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  })
  const NumerContainer = styled('div', {
    width: '100%',
    marginTop: '15px'
  })
  const LargeNumber = styled(SelectedCount, {
    fontSize: '30px',
    width: '100%',
  })
  const SmallNumber = styled('div', {
    width: '100%',
    textAlign: 'right',
    alignSelf: 'flex-end'
  })
  return (
    <StatsCard>
      <Heading content={content} label={label}/>
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

const ListCard = ({label, list, content}) => {
  const StatsCard = changeCard('white')
  const Table = styled('div', {
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
    width: '100%',
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
      <Heading content={content} label={label}/>
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

const GraphCard = ({label, list, content}) => {
  const StatsCard = changeCard('white')
  let width = 0
  const data = []
  for (const [objkey, objval] of Object.entries(list)) {
    data.push({"name": objkey, "Total Labels": objval})
    width = Math.max(width, objkey.length)
  }
  width = (width - 6) * 9 + 60 
  data.sort(function(a , b){return b["Total Labels"] - a["Total Labels"]})
  function GetHeight() {
    return 250 + ((data.length > 12) ? ((data.length - 12) * 20) : 0);
  }

  return (
    <StatsCard>
      <Heading content={content} label={label}/>
      <div style={{overflowY: 'scroll', overflowX: 'scroll'}}>
        <ResponsiveContainer width="100%" height={GetHeight()}>
          <BarChart
            layout="vertical"
            data={data}
          >
            <CartesianGrid stroke="#f5f5f5" />
            <XAxis type="number" allowDecimals={false}/>
            <YAxis width={width} dataKey="name" type="category" scale="auto" interval={0} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Total Labels"  fill={indigo.indigo11}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
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
            <div style={{display: 'flex', flexDirection: 'row', gap: '10px'}}>
              <StatsItem  name={"imageCount"} stat={stats["imageCount"]}></StatsItem>
              <StatsItem  name={"reviewedCount"} stat={stats["reviewedCount"]}></StatsItem>
              <StatsItem name={"multiReviewerCount"} stat={stats["multiReviewerCount"]}></StatsItem>
            </div>
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
              <StatsItem name={"labelList"} stat={stats["labelList"]}></StatsItem>
            </div>
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
              <StatsItem name={"reviewerList"} stat={stats["reviewerList"]}></StatsItem>
            </div>
          </StatsDash>
        </div>
      )}
    </div>
  );
};
export default ImagesStatsModal;
