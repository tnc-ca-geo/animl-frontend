import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import {
  selectDateCreatedFilter,
  dateCreatedFilterChanged,
} from './imagesSlice';
import { Grid, Row, Col } from '../../components/Grid';
import DateRangePickerWrapper from '../../components/DateRangePicker';
import { DATE_FORMAT } from '../../config';


const DateCreatedFilter = () => {
  const { start, end } = useSelector(selectDateCreatedFilter);
  const dispatch = useDispatch();

  const handleDatesChange = ({ startDate, endDate }) => {
    startDate = startDate.format(DATE_FORMAT);
    endDate = endDate.format(DATE_FORMAT);
    dispatch(dateCreatedFilterChanged({ startDate, endDate }));
  };

  return (
    <Grid>
      <DateRangePickerWrapper
        sdate={moment(start, DATE_FORMAT)}
        edate={moment(end, DATE_FORMAT)}
        handleDatesChange={handleDatesChange}
      />
    </Grid>
  );
};

export default DateCreatedFilter;

