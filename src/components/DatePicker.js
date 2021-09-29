import React, { useState } from 'react';
import moment from 'moment';
import { styled } from '../theme/stitches.config.js';
import 'react-dates/initialize';
import { SingleDatePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import { DATE_FORMAT_EXIF as EXIF } from '../config';

// TODO: clean uop date range picker styling
const StyledDateRangePicker = styled('div', {
  '.DateInput_input': {
    color: '$hiContrast',
    fontFamily: '$mono',
    fontWeight: '$2',
  },
  '.DateInput__small': {
    width: '100%',
  },
  '.SingleDatePickerInput__withBorder': {
    border: 'none'
  },
  // '.DateInput_input__focused': {
  //   borderBottomColor: '$blue600',
  // },
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

const DatePickerWithFormik = ({
  startDateId,
  endDateId,
  form: { setFieldValue, setFieldTouched, values },
  field,
  ...props
}) => {
  const [focusedInput, setFocusedInput] = useState(null);

  return (
    <StyledDateRangePicker>
      <SingleDatePicker
        date={values.startDate ? moment(values.startDate, EXIF) : null}
        onDateChange={(date) => {
          const formattedDate = moment(date).format(EXIF);
          setFieldValue('startDate', formattedDate);
        }}
        focused={focusedInput}
        onFocusChange={({focused}) => setFocusedInput(focused)}
        id='startDate'
        small={true}
        hideKeyboardShortcutsPanel={true}
        enableOutsideDays={true}
        isOutsideRange={() => false}
      />
    </StyledDateRangePicker>
  );
};

export default DatePickerWithFormik;
