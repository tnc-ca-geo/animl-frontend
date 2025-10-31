import React from 'react';
import moment from 'moment-timezone';
import { timeZonesNames } from '@vvo/tzdb';
import { styled } from '../theme/stitches.config.js';
import { StandAloneInput } from './Form.jsx';
import SelectField from './SelectField.jsx';

const Container = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$3',
});

const DateTimeInput = styled(StandAloneInput, {
  fontSize: '$3',
  padding: '$2 $3',
  '&::-webkit-calendar-picker-indicator': {
    cursor: 'pointer',
  },
});

const DateTimePicker = ({ datetime, timezone, onDateTimeChange, onTimezoneChange }) => {
  const tzOptions = [
    { value: 'UTC', label: 'UTC' },
    ...timeZonesNames.map((tz) => ({ value: tz, label: tz }))
  ];

  const formatForInput = (date) => {
    if (!date) return '';
    const m = moment(date);
    return m.format('YYYY-MM-DDTHH:mm:ss');
  };

  const handleChange = (e) => {
    const value = e.target.value;
    if (!value) return;

    const tz = timezone?.value || 'UTC';
    const newDateTime = moment.tz(value, tz).toDate();
    onDateTimeChange(newDateTime);
  };

  return (
    <Container>
      <div>
        <label htmlFor="datetime-input">Date and Time</label>
        <DateTimeInput
          id="datetime-input"
          type="datetime-local"
          step="1"
          value={formatForInput(datetime)}
          onChange={handleChange}
        />
      </div>

      <div>
        <SelectField
          name="timezone"
          label="Timezone"
          value={timezone}
          onChange={(name, value) => onTimezoneChange(value)}
          options={tzOptions}
          isSearchable={true}
          menuPlacement="auto"
        />
      </div>
    </Container>
  );
};

export default DateTimePicker;
