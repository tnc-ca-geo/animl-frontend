import React from 'react';
import moment from 'moment-timezone';
import { styled } from '../theme/stitches.config.js';
import { StandAloneInput } from './Form.jsx';

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

const DateTimePicker = ({ datetime, onDateTimeChange }) => {
  const formatForInput = (date) => {
    if (!date) return '';
    const m = moment(date);
    return m.format('YYYY-MM-DDTHH:mm:ss');
  };

  const handleChange = (e) => {
    const value = e.target.value;
    if (!value) return;

    const newDateTime = moment(value).toDate();
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
    </Container>
  );
};

export default DateTimePicker;
