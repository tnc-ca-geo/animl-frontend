import React, { useState } from 'react';
import moment from 'moment-timezone';
import 'react-dates/initialize';
import { SingleDatePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import { DATE_FORMAT_EXIF as EXIF } from '../config';

// NOTE: Date Picker style overrides are in theme/globalStyles.js
// Had to override them there b/c the actual Date Picker element gets 
// appended to the body (and thus you can't dump style overrides in a 
// wrapper element

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
      // date={values.startDate || null}
      date={getDate(values.startDate, props.timezone, setFieldValue)}
      onDateChange={(date) => {

        // date = moment(date).startOf('day');
        // date = date.toISOString();

        // console.log('onDateChange firing. setting date to: ', date);

        // console.log('onDateChange firing. date tz is: ', date.tz());

        console.log('onDateChange firing - date tz matches form tz? ', date.tz() === props.timezone)

        // if date prop was not initially hydrated w/ a moment date (i.e., it was null)
        // we will need to update the new date's TZ (while keeping the local date)
        if (date.tz() !== props.timezone) {
          console.log('onDateChange firing - setting tz')
          date = date.tz(props.timezone, true);
        }

        // // initially it thinks it's noon in my local tz
        // console.log(`onDateChange firing - date: ${date}`);

        // // then we SHIFT the tz - true keeps the local time but changes TZ
        // date = date.tz(props.timezone, true);
        // console.log(`onDateChange firing - date after TZ w/ keep local time set: ${date}`)

        // // then we reset it to start of day
        // date = moment(date).startOf('day');
        // console.log(`onDateChange firing - date after startOfDay reset: ${date}`)

        // date = date.toISOString();
        // console.log(`onDateChange firing - date after ISO string conversion: ${date}`)

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

function getDate(startDate, deploymentTimezone, setFieldValue) {
  console.log('SingleDatePicker - setting date prop - values.startDate: ', startDate);
  if (!startDate) return null;
  if (startDate.tz() !== deploymentTimezone) {
    console.log('SingleDatePicker - deployment timezone & start date timezone are not the same!! setting new Field value');
    // if the startDate's timezone !== deployment's timezone, 
    // set startDates' tz to deployments, while keeping the local time
    setFieldValue('startDate', startDate.tz(deploymentTimezone, true));
  }
  else {
    return startDate;
  }
}


export default DatePickerWithFormik;
