import 'react-dates/initialize';
import React, { useState, useRef } from 'react';
import moment from 'moment-timezone';
import { DateRangePicker, isInclusivelyBeforeDay } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import { inViewportTopHalf } from '../app/utils';
import { useSelector } from 'react-redux';
import { selectGlobalBreakpoint } from '../features/projects/projectsSlice';
import { globalBreakpoints } from '../config';

// NOTE: Date Picker style overrides are in theme/globalStyles.js
// Had to override them there b/c the actual Date Picker element gets
// appended to the body (and thus you can't dump style overrides in a
// wrapper element)

const DateRangePickerWrapper = ({ sdate, edate, handleDatesChange }) => {
  const [focusedInput, setFocusedInput] = useState(null);

  const [openDirection, setOpenDirection] = useState('down');
  const containerEl = useRef(null);
  const determineOpenDirection = () => {
    const od = inViewportTopHalf(containerEl.current) ? 'down' : 'up';
    setOpenDirection(od);
  };

  const onDatesChange = ({ startDate, endDate }) => {
    if (startDate) {
      startDate = moment(startDate).startOf('day').toISOString();
    }
    if (endDate) {
      endDate = moment(endDate).endOf('day').toISOString();
    }
    handleDatesChange({ startDate, endDate });
  };

  const onFocusChange = (focusedInput) => {
    determineOpenDirection();
    setFocusedInput(focusedInput);
  };

  const currentBreakpoint = useSelector(selectGlobalBreakpoint);
  const isSmallScreen = globalBreakpoints.lessThanOrEqual(currentBreakpoint, 'xs');

  return (
    <div ref={containerEl}>
      <DateRangePicker
        startDate={sdate ? moment(sdate) : null}
        startDateId="startDate"
        endDate={edate ? moment(edate) : null}
        endDateId="endDate"
        onDatesChange={onDatesChange}
        focusedInput={focusedInput}
        onFocusChange={onFocusChange}
        showClearDates={true}
        small={true}
        hideKeyboardShortcutsPanel={true}
        isOutsideRange={(day) => !isInclusivelyBeforeDay(day, moment())}
        block={true}
        appendToBody={true}
        openDirection={openDirection}
        numberOfMonths={isSmallScreen ? 1 : 2}
      />
    </div>
  );
};

export default DateRangePickerWrapper;
