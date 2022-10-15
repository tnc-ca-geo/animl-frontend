import 'react-dates/initialize';
import React, { useState, useRef } from 'react';
import moment from 'moment';
import { DateRangePicker, isInclusivelyBeforeDay } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import { DATE_FORMAT_EXIF as EXIF } from '../config';
import { inViewportTopHalf } from '../app/utils';

// NOTE: Date Picker style overrides are in theme/globalStyles.js
// Had to override them there b/c the actual Date Picker element gets 
// appended to the body (and thus you can't dump style overrides in a 
// wrapper element)

const DateRangePickerWrapper = ({ sdate, edate, handleDatesChange }) => {
  const [focusedInput, setFocusedInput] = useState(null);

  const [openDirection, setOpenDirection] = useState('down')
  const containerEl = useRef(null);
  const determineOpenDirection = () => {
    const od = inViewportTopHalf(containerEl.current) ? 'down' : 'up';
    setOpenDirection(od);
  };

  const onDatesChange = (dates) => {
    for (const key of Object.keys(dates)) {
      if (dates[key]) {
        dates[key] = moment(dates[key]).startOf('day');
        dates[key] = dates[key].format(EXIF);
      }
    }
    handleDatesChange(dates);
  };

  const onFocusChange = (focusedInput) => {
    determineOpenDirection();
    setFocusedInput(focusedInput);
  };

  return (
    <div ref={containerEl}>
      <DateRangePicker
        startDate={sdate}
        startDateId='startDate'
        endDate={edate}
        endDateId='endDate'
        onDatesChange={onDatesChange}
        focusedInput={focusedInput}
        onFocusChange={onFocusChange}
        showClearDates={true}
        small={true}
        hideKeyboardShortcutsPanel={true}
        isOutsideRange={day => !isInclusivelyBeforeDay(day, moment())}
        block={true}
        appendToBody={true}
        openDirection={openDirection}
      />
    </div>
  );
};

export default DateRangePickerWrapper;