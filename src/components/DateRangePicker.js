import 'react-dates/initialize';
import React, { useState } from 'react';
import moment from 'moment';
import { DateRangePicker, isInclusivelyBeforeDay } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import { styled } from '../theme/stitches.config';
import { DATE_FORMAT_EXIF as EXIF } from '../config';

// TODO: clean uop date range picker styling
const StyledDateRangePicker = styled('div', {
  '.DateInput_input': {
    color: '$hiContrast',
    fontFamily: '$mono',
    fontWeight: '$2',
  },
  '.DateInput__small': {
    width: '109px',
  },
  '.DateInput_input__focused': {
    borderBottomColor: '$blue600',
  },
  '.DateRangePickerInput_clearDates_default:focus': {
    backgroundColor: '$gray300',
  },
  '.DateRangePickerInput_clearDates_default:hover': {
    backgroundColor: '$gray200',
  },
  '.CalendarDay__default': {
    border: 'none',
  },
  '.CalendarDay__blocked_out_of_range': {
    border: 'none',
  },
  '.CalendarDay__selected_span': {
    background: '$blue200',
    color: '$hiContrast',
    border: '1px solid $gray400',
  },
  '.CalendarDay__selected': {
    background: '$blue600',
    color: '$loContrast',
    border: '1px solid $blue600',
  },
  '.CalendarDay__selected_span:hover': {
    background: '$blue400',
    color: '$loContrast',
  },
  '.CalendarDay__selected:hover': {
    background: '$blue400',
    color: '$loContrast',
    border: '1px solid $blue200',
  },
  '.CalendarDay__hovered_span': {
    background: '$gray200',
    color: '$hiContrast',
    borderLeft: 'none',
    borderRight: 'none',
    borderTop: '$2 solid $loContrast',
    borderBottom: '$2 solid $loContrast',
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
        onDatesChange={(dates) => {
          for (const key of Object.keys(dates)) {
            if (dates[key]) {
              dates[key] = moment(dates[key]).startOf('day');
              dates[key] = dates[key].format(EXIF);
            }
          }
          handleDatesChange(dates);
        }}
        focusedInput={focusedInput}
        onFocusChange={focusedInput => setFocusedInput(focusedInput)}
        showClearDates={true}
        small={true}
        hideKeyboardShortcutsPanel={true}
        isOutsideRange={day => !isInclusivelyBeforeDay(day, moment())}
        // withPortal={true}
      />
    </StyledDateRangePicker>
  );
};

export default DateRangePickerWrapper;