import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import {
  selectDateCreatedFilter,
  selectDateAddedFilter,
  dateFilterChanged,
} from './filtersSlice';
import Accordion from '../../components/Accordion';
import DateRangePickerWrapper from '../../components/DateRangePicker';
import { DATE_FORMAT_EXIF as EXIF } from '../../config';

const selectorMap = {
  'created': selectDateCreatedFilter,
  'added': selectDateAddedFilter,
};

const DateFilter = ({ type }) => {
  const { start, end } = useSelector(selectorMap[type]);
  const dispatch = useDispatch();

  const handleDatesChange = ({ startDate, endDate }) => {
    console.log('dateFilteChanged: ', startDate)
    dispatch(dateFilterChanged({ startDate, endDate, type }));    
  };

  return (
    <Accordion
      label={'Date ' + type}
      expandedDefault={false}
    >
      <DateRangePickerWrapper
        sdate={start || null}
        edate={end || null}
        handleDatesChange={handleDatesChange}
      />
    </Accordion>
  );
};

export default DateFilter;

