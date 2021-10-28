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
    dispatch(dateFilterChanged({ startDate, endDate, type }));    
  };

  return (
    <Accordion
      label={'Date ' + type}
      expandedDefault={false}
    >
      <DateRangePickerWrapper
        sdate={start ? moment(start, EXIF) : null}
        edate={end ? moment(end, EXIF) : null}
        handleDatesChange={handleDatesChange}
      />
    </Accordion>
  );
};

export default DateFilter;

