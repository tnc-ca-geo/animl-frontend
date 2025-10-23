import React from 'react';
import { styled } from '../theme/stitches.config.js';

const TimestampContainer = styled('div', {
  display: 'flex',
  gap: '$3',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
});

const TimestampField = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$2',
});

const TimestampLabel = styled('label', {
  fontSize: '$3',
  fontWeight: '$5',
  color: '$green700',
  textTransform: 'capitalize',
});

const TimestampInput = styled('input', {
  fontSize: '$4',
  fontFamily: '$sourceSansPro',
  color: '$textMedium',
  padding: '$3',
  boxSizing: 'border-box',
  border: '1px solid',
  borderColor: '$border',
  backgroundColor: '#FFFFFF',
  borderRadius: '$1',
  width: '100%',
  '&:focus': {
    transition: 'all 0.2s ease',
    outline: 'none',
    boxShadow: '0 0 0 3px $gray3',
    '&:hover': {
      boxShadow: '0 0 0 3px $blue200',
      borderColor: '$blue500',
    },
  },
});

const TimeGroup = styled('div', {
  display: 'flex',
  gap: '$2',
  alignItems: 'center',
});

const TimeSeparator = styled('span', {
  fontSize: '$4',
  color: '$textMedium',
  paddingTop: '28px',
});

const AMPMSelect = styled('select', {
  fontSize: '$4',
  fontFamily: '$sourceSansPro',
  color: '$textMedium',
  padding: '$3',
  boxSizing: 'border-box',
  border: '1px solid',
  borderColor: '$border',
  backgroundColor: '#FFFFFF',
  borderRadius: '$1',
  '&:focus': {
    transition: 'all 0.2s ease',
    outline: 'none',
    boxShadow: '0 0 0 3px $gray3',
    '&:hover': {
      boxShadow: '0 0 0 3px $blue200',
      borderColor: '$blue500',
    },
  },
});

const TimestampPicker = ({
  year,
  month,
  day,
  hour,
  minute,
  second,
  ampm,
  onYearChange,
  onMonthChange,
  onDayChange,
  onHourChange,
  onMinuteChange,
  onSecondChange,
  onAMPMChange,
}) => {
  return (
    <TimestampContainer>
      <TimestampField css={{ width: '100px' }}>
        <TimestampLabel htmlFor="year">Year</TimestampLabel>
        <TimestampInput
          id="year"
          type="number"
          min="1900"
          max="2100"
          value={year}
          onChange={(e) => onYearChange(e.target.value)}
        />
      </TimestampField>

      <TimestampField css={{ width: '80px' }}>
        <TimestampLabel htmlFor="month">Month</TimestampLabel>
        <TimestampInput
          id="month"
          type="number"
          min="1"
          max="12"
          value={month}
          onChange={(e) => onMonthChange(e.target.value)}
        />
      </TimestampField>

      <TimestampField css={{ width: '80px' }}>
        <TimestampLabel htmlFor="day">Day</TimestampLabel>
        <TimestampInput
          id="day"
          type="number"
          min="1"
          max="31"
          value={day}
          onChange={(e) => onDayChange(e.target.value)}
        />
      </TimestampField>

      <TimestampField>
        <TimestampLabel>Time</TimestampLabel>
        <TimeGroup>
          <TimestampInput
            type="number"
            min="1"
            max="12"
            value={hour}
            onChange={(e) => onHourChange(e.target.value)}
            css={{ width: '60px' }}
          />
          <TimeSeparator>:</TimeSeparator>
          <TimestampInput
            type="number"
            min="0"
            max="59"
            value={minute}
            onChange={(e) => onMinuteChange(e.target.value)}
            css={{ width: '60px' }}
          />
          <TimeSeparator>:</TimeSeparator>
          <TimestampInput
            type="number"
            min="0"
            max="59"
            value={second}
            onChange={(e) => onSecondChange(e.target.value)}
            css={{ width: '60px' }}
          />
          <AMPMSelect
            value={ampm}
            onChange={(e) => onAMPMChange(e.target.value)}
            css={{ width: '70px' }}
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </AMPMSelect>
        </TimeGroup>
      </TimestampField>
    </TimestampContainer>
  );
};

export default TimestampPicker;
