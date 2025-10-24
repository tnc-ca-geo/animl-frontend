import React from 'react';
import moment from 'moment-timezone';
import { timeZonesNames } from '@vvo/tzdb';
import { styled } from '../theme/stitches.config.js';
import SelectField from './SelectField.jsx';

const Container = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$3',
});

const DateTimeSection = styled('div', {
  width: '100%',
});

const TimezoneSection = styled('div', {
  width: '100%',
});

const Label = styled('label', {
  fontSize: '$3',
  fontWeight: '$5',
  color: '$textDark',
  marginBottom: '$2',
  display: 'block',
});

const DateTimeInput = styled('input', {
  fontSize: '$3',
  fontFamily: '$sourceSansPro',
  color: '$textMedium',
  padding: '$2 $3',
  boxSizing: 'border-box',
  border: '1px solid',
  borderColor: '$border',
  backgroundColor: '#FFFFFF',
  borderRadius: '$1',
  width: '100%',
  '&:focus': {
    outline: 'none',
    borderColor: '$blue500',
    boxShadow: '0 0 0 1px $blue500',
  },
  '&::-webkit-calendar-picker-indicator': {
    cursor: 'pointer',
  },
});

const DateTimePicker = ({ datetime, timezone, onDateTimeChange, onTimezoneChange }) => {
  const tzOptions = [
    { value: 'UTC', label: 'UTC' },
    ...timeZonesNames.map((tz) => ({ value: tz, label: tz }))
  ];

  // Convert datetime to format for datetime-local input (YYYY-MM-DDTHH:mm:ss)
  const formatForInput = (date) => {
    if (!date) return '';
    const m = moment(date);
    // Format: YYYY-MM-DDTHH:mm:ss (local time for the input)
    return m.format('YYYY-MM-DDTHH:mm:ss');
  };

  const handleChange = (e) => {
    const value = e.target.value;
    if (!value) return;

    // Parse the datetime string AS IF it's in the selected timezone
    // The datetime-local input gives us "YYYY-MM-DDTHH:mm:ss"
    // We interpret this in the context of the selected timezone
    const tz = timezone?.value || 'UTC';
    const newDateTime = moment.tz(value, tz).toDate();
    onDateTimeChange(newDateTime);
  };

  return (
    <Container>
      <DateTimeSection>
        <Label htmlFor="datetime-input">Date and Time</Label>
        <DateTimeInput
          id="datetime-input"
          type="datetime-local"
          step="1"
          value={formatForInput(datetime)}
          onChange={handleChange}
        />
      </DateTimeSection>

      <TimezoneSection>
        <SelectField
          name="timezone"
          label="Timezone"
          value={timezone}
          onChange={(name, value) => onTimezoneChange(value)}
          options={tzOptions}
          isSearchable={true}
          menuPlacement="auto"
        />
      </TimezoneSection>
    </Container>
  );
};

export default DateTimePicker;
