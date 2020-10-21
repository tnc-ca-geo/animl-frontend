import 'react-dates/initialize';
import React, { useState } from 'react';
import moment from 'moment';
import { DateRangePicker, isInclusivelyBeforeDay } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import { styled } from '../theme/stitches.config';

const StyledDateRangePicker = styled.div({
  '.DateInput_input__focused': {
    borderBottomColor: '$blue600',
  },
  '.DateRangePickerInput_clearDates_default:focus': {
    backgroundColor: '$gray300',
  },
  '.DateRangePickerInput_clearDates_default:hover': {
    backgroundColor: '$gray200',
  },
  '.CalendarDay__selected_span': {
    background: '$blue200',
    color: '$hiContrast',
    border: '$1 solid $gray400',
  },
  '.CalendarDay__selected': {
    background: '$blue600',
    color: '$loContrast',
    border: '$1 solid $blue600',
  },
  '.CalendarDay__selected_span:hover': {
    background: '$blue400',
    color: '$loContrast',
  },
  '.CalendarDay__selected:hover': {
    background: '$blue400',
    color: '$loContrast',
    border: '$1 solid $blue200',
  },
});

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
        small={true}
        hideKeyboardShortcutsPanel={true}
        isOutsideRange={day => !isInclusivelyBeforeDay(day, moment())}
      />
    </StyledDateRangePicker>
  );
};

export default DateRangePickerWrapper;