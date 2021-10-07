import React, { useState } from 'react';
import moment from 'moment';
import { styled } from '../theme/stitches.config.js';
import 'react-dates/initialize';
import { SingleDatePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import { DATE_FORMAT_EXIF as EXIF } from '../config';

// NOTE: Date Picker style overrides are in theme/globalStyles.js
// Had to override them there b/c the actual Date Picker element gets 
// appended to the body (and thus you can't dump style overrides in a 
// wrapper element)

const DatePickerWithFormik = ({
  startDateId,
  endDateId,
  form: { setFieldValue, setFieldTouched, values },
  field,
  ...props
}) => {
  const [focusedInput, setFocusedInput] = useState(null);

  return (
    <SingleDatePicker
      date={values.startDate ? moment(values.startDate, EXIF) : null}
      onDateChange={(date) => {
        date = moment(date).startOf('day');
        date = date.format(EXIF);
        setFieldValue('startDate', date);
      }}
      focused={focusedInput}
      onFocusChange={({focused}) => setFocusedInput(focused)}
      id='startDate'
      small={true}
      hideKeyboardShortcutsPanel={true}
      enableOutsideDays={true}
      isOutsideRange={() => false}
    />
  );
};

export default DatePickerWithFormik;
