import React, { useState, useRef } from 'react';
import moment from 'moment-timezone';
import 'react-dates/initialize';
import { SingleDatePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import { inViewportTopHalf } from '../app/utils';

// NOTE: Date Picker style overrides are in theme/globalStyles.js
// Had to override them there b/c the actual Date Picker element gets
// appended to the body (and thus you can't dump style overrides in a
// wrapper element

const DatePickerWithFormik = ({
  form: { setFieldValue, setFieldTouched, setFieldError, values },
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
        date={values.startDate ? moment(values.startDate) : null}
        onDateChange={(date) => {
          setFieldTouched('startDate', true, false);
          if (moment(date).isValid()) {
            date = moment(date).startOf('day');
            setFieldValue('startDate', date.toISOString());
          } else {
            setFieldError('startDate', 'Enter date as MM/DD/YYYY');
          }
        }}
        focused={focusedInput}
        onFocusChange={onFocusChange}
        id="startDate"
        small={true}
        hideKeyboardShortcutsPanel={true}
        enableOutsideDays={true}
        isOutsideRange={() => false}
        openDirection={openDirection}
        appendToBody={true}
      />
    </div>
  );
};

export default DatePickerWithFormik;
