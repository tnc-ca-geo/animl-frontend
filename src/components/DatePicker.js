import React, { useState, useRef } from 'react';
import moment from 'moment';
import 'react-dates/initialize';
import { SingleDatePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import { DATE_FORMAT_EXIF as EXIF } from '../config';
import { inViewportTopHalf } from '../app/utils';

// NOTE: Date Picker style overrides are in theme/globalStyles.js
// Had to override them there b/c the actual Date Picker element gets 
// appended to the body (and thus you can't dump style overrides in a 
// wrapper element)

const DatePickerWithFormik = ({
  startDateId,
  endDateId,
  form: { setFieldValue, setFieldTouched, setFieldError, values },
  field,
  ...props
}) => {
  const [focusedInput, setFocusedInput] = useState(null);

  const [openDirection, setOpenDirection] = useState('down');
  const containerEl = useRef(null);
  const determineOpenDirection = () => {
    const od = inViewportTopHalf(containerEl.current) ? 'down' : 'up';
    setOpenDirection(od);
  };

  const onFocusChange = ({ focused }) => {
    determineOpenDirection();
    setFocusedInput(focused);
  };

  return (
    <div ref={containerEl}>
      <SingleDatePicker
        placeholder='MM/DD/YYYY'
        date={values.startDate ? moment(values.startDate, EXIF) : null}
        onDateChange={(date) => {
          setFieldTouched('startDate', true, false);
          if (moment(date).isValid()) {
            date = moment(date).startOf('day');
            date = date.format(EXIF);
            setFieldValue('startDate', date);
          } else {
            setFieldError('startDate', 'Enter date as MM/DD/YYYY')
          }
        }}
        focused={focusedInput}
        onFocusChange={onFocusChange}
        id='startDate'
        small={true}
        hideKeyboardShortcutsPanel={true}
        enableOutsideDays={true}
        isOutsideRange={() => false}
        openDirection={openDirection}
      />
    </div>
  );
};

export default DatePickerWithFormik;
