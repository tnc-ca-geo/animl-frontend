import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import {
  selectDateCreatedFilter,
  dateCreatedFilterChanged,
} from './filtersSlice';
import DateRangePickerWrapper from '../../components/DateRangePicker';
import { DATE_FORMAT_EXIF as DFE } from '../../config';

const DateCreatedFilter = () => {
  const { start, end } = useSelector(selectDateCreatedFilter);
  const dispatch = useDispatch();

  const handleDatesChange = ({ startDate, endDate }) => {
    startDate = startDate.format(DFE);
    endDate = endDate.format(DFE);
    dispatch(dateCreatedFilterChanged({ startDate, endDate }));
  };

  return (
    <DateRangePickerWrapper
      sdate={moment(start, DFE)}
      edate={moment(end, DFE)}
      handleDatesChange={handleDatesChange}
    />
  );
};

export default DateCreatedFilter;

