import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectDateCreatedFilter, selectDateAddedFilter, dateFilterChanged } from './filtersSlice';
import Accordion from '../../components/Accordion';
import DateRangePickerWrapper from '../../components/DateRangePicker';

const selectorMap = {
  created: selectDateCreatedFilter,
  added: selectDateAddedFilter,
};

const DateFilter = ({ type }) => {
  const { start, end } = useSelector(selectorMap[type]);
  const dispatch = useDispatch();

  const handleDatesChange = ({ startDate, endDate }) => {
    dispatch(dateFilterChanged({ startDate, endDate, type }));
  };

  return (
    <Accordion label={'Date ' + type} expandedDefault={false} expandOnHeaderClick={true}>
      <DateRangePickerWrapper
        sdate={start || null}
        edate={end || null}
        handleDatesChange={handleDatesChange}
      />
    </Accordion>
  );
};

export default DateFilter;
