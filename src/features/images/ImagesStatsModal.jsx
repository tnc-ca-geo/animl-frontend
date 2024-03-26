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
import Accordion from '../../components/Accordion';
import {Label, SelectedCount, AccordionHeaderNoHover} from '../../components/Accordion.jsx';
import { CheckboxLabel } from '../../components/CheckboxLabel.jsx';

const StatsInnerDisplay = styled('div', {
  border: '1px solid $border',
  maxHeight: '50vh',
  overflowY: 'scroll',

});
const StatsDisplay = styled('div', {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '5px',
  userSelect: 'none',
  touchAction: 'none'
});


const StatsItemNoList = ({label, count}) => {
  return (
    <AccordionHeaderNoHover>
      <Label>{label}</Label>
      <SelectedCount>{count}</SelectedCount>
    </AccordionHeaderNoHover>
  );
};

let mappings = {};
mappings = {imageCount: "Image Count:", reviewedCount: "Reviewed Images:",
  reviewerList: "Reviewer List:", notReviewed: "Not Reviewed:", labelList: "Label List:",
  multiReviewerCount: "Multi Reviewer Count:", userId: "User:", reviewed: "Reviewed:"};
function mapLabel(s) {
  return (mappings[s] == undefined) ? (s + ":") : mappings[s];
}
const StatsItem = ({stat}) => {
  let value = stat['value']
  const condition = Number.isInteger(value)
  return (
    <>
      {condition ? 
      <StatsItemNoList label={stat['key']} count={value}/> :
      <Accordion label={stat['key']} expandedDefault={false}>
        {value.map((v, index) => (
            <CheckboxLabel key={index} checked={true}
            css={{ fontFamily: '$sourceSansPro' }}>{v['key']} {v['value']}</CheckboxLabel>
        ))}
      </Accordion>
      }
    </>
  );
};
//will actually be a function that returns either a label or list if 
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
        each reviewer&apos;s &quot;reviewedCount&quot; is the total number of <em>images</em> they
        have edited in some way (validated/invalidated a label, added objects, etc.). Because
        multiple users can edit the same image, and because images that have been edited can still
        be considered &quot;not reviewed&quot; (e.g., if a user invalidated all labels on all
        objects, but did&apos;t mark it empty), the sum of all reviewers &quot;reviewedCounts&quot;
        very likely will not equal the &quot;reviewedCount&quot; &quot;reviewed&quot; quantity
      </li>
      <li>
        the quantities in the &quot;labelList&quot; are for locked objects with <em>validated</em>{' '}
        labels only, so they do not include ML predicted labels that need review
      </li>
    </ul>
  </StyledStatsDisclaimer>
);



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
  
  
  const Stats = [];
  /** Parses JSON array */
  function parseArray(value) {
    let arr = []; let j = 0; let arraykey = "";
    for (let k = 0; k < value.length; k++) {
      let arrayval = "";
      for (const [key, val] of Object.entries(value[k])) {
        arraykey = (arraykey == "") ? (mapLabel(key)) : arraykey;
        arrayval = (arrayval == "") ? (arrayval + val) : (arrayval + ", " + mapLabel(key) + " " + val);
      }
      arr[j++] = {"key": arraykey, "value": arrayval};
    }
    return arr;
  }
  /** Converts stats to key/value pairs*/
  function ConvertStats(stats) {
    let i = 0;
    for (const [key, value] of Object.entries(stats)) {
      if (Number.isInteger(value)) {
        Stats[i++] = {"key": mapLabel(key), "value": value};
      }
      else {
        if (Array.isArray(value)) {
          Stats[i++] = {"key": mapLabel(key), "value": parseArray(value)}
        } else {
          let arr = []; let j = 0;
          for (const [objkey, objval] of Object.entries(value)) {
            arr[j++] = {"key": mapLabel(objkey), "value": objval}
          }
          Stats[i++] = {"key": mapLabel(key), "value": arr}
        }
      }
    }
  }

  if (stats != null) {
    ConvertStats(stats);
  }
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
      {stats && Stats && (Stats.length > 0) && (
        <>
          <StatsDisplay>
          <StatsInnerDisplay>
            {Stats.map((stat, index) => (
                    <StatsItem key={index} stat = {stat}/>
                ))}
          </StatsInnerDisplay>
          </StatsDisplay>
          <StatsDisclaimer />
        </>
      )}
    </div>
  );
};
export default ImagesStatsModal;
