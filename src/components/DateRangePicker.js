import 'react-dates/initialize';
import React, { useState } from 'react';
import moment from 'moment';
import { DateRangePicker, isInclusivelyBeforeDay } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import styled from 'styled-components';

const StyledDateRangePicker = styled.div`

`;

const DateRangePickerWrapper = ({ sdate, edate, handleDatesChange }) => {
  const [focusedInput, setFocusedInput] = useState(null); // what does this do?

  return (
    <StyledDateRangePicker>
      <DateRangePicker
        startDate={sdate}
        startDateId='startDate'
        endDate={edate}
        endDateId='endDate'
        onDatesChange={handleDatesChange}
        focusedInput={focusedInput}
        onFocusChange={focusedInput => setFocusedInput(focusedInput)}
        showClearDates={true}
        showDefaultInputIcon={true}
        small={true}
        hideKeyboardShortcutsPanel={true}
        isOutsideRange={day => !isInclusivelyBeforeDay(day, moment())}
      />
    </StyledDateRangePicker>
  );
};

export default DateRangePickerWrapper;