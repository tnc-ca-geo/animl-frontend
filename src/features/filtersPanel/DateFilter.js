import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import {
  selectDateCreatedFilter,
  selectDateAddedFilter,
  dateFilterChanged,
} from './filtersSlice';
import DateRangePickerWrapper from '../../components/DateRangePicker';
import { DATE_FORMAT_EXIF as DFE } from '../../config';

const selectorMap = {
  'dateCreated': selectDateCreatedFilter,
  'dateAdded': selectDateAddedFilter,
};

const DateFilter = ({ type }) => {
  const { start, end } = useSelector(selectorMap[type]);
  const dispatch = useDispatch();

  const handleDatesChange = ({ startDate, endDate }) => {
    startDate = startDate ? startDate.format(DFE) : null;
    endDate = endDate ? endDate.format(DFE) : null;
    dispatch(dateFilterChanged({ startDate, endDate, type }));    
  };

  return (
    <DateRangePickerWrapper
      sdate={start ? moment(start, DFE) : null}
      edate={end ? moment(end, DFE) : null}
      handleDatesChange={handleDatesChange}
    />
  );
};

export default DateFilter;

