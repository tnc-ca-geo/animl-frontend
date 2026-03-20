import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { indigo, green, orange } from '@radix-ui/colors';
import { selectHistory, selectHistoryRange, setHistoryRange } from './adminSlice';

const Section = styled('div', {
  background: '$loContrast',
  border: '1px solid $border',
  borderRadius: '$2',
  padding: '$4',
  marginBottom: '$4',
});

const SectionHeader = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '$2',
  marginBottom: '$4',
});

const SectionTitle = styled('h3', {
  fontSize: '$5',
  fontWeight: '$5',
  color: '$textDark',
  margin: 0,
});

const RangeControls = styled('div', {
  display: 'flex',
  gap: '$1',
  flexWrap: 'wrap',
});

const RangeButton = styled('button', {
  padding: '$1 $3',
  fontSize: '$3',
  fontFamily: '$roboto',
  border: '1px solid $border',
  borderRadius: '$2',
  cursor: 'pointer',
  backgroundColor: '$loContrast',
  color: '$textMedium',
  transition: 'all 0.15s ease',
  '&:hover': {
    backgroundColor: '$backgroundDark',
    color: '$textDark',
  },
  variants: {
    active: {
      true: {
        backgroundColor: '$blue200',
        borderColor: '$blue500',
        color: '$textDark',
        fontWeight: '$4',
      },
    },
  },
});

const CustomDateInputs = styled('div', {
  display: 'flex',
  gap: '$2',
  alignItems: 'center',
  marginTop: '$2',
});

const DateInput = styled('input', {
  padding: '$1 $2',
  fontSize: '$3',
  fontFamily: '$roboto',
  border: '1px solid $border',
  borderRadius: '$2',
  color: '$textDark',
  backgroundColor: '$loContrast',
  '&:focus': {
    outline: 'none',
    borderColor: '$blue500',
  },
});

const ApplyButton = styled('button', {
  padding: '$1 $3',
  fontSize: '$3',
  fontFamily: '$roboto',
  border: '1px solid $blue500',
  borderRadius: '$2',
  cursor: 'pointer',
  backgroundColor: '$blue200',
  color: '$textDark',
  '&:hover': {
    backgroundColor: '$blue300',
  },
});

const ChartTooltipWrapper = styled('div', {
  backgroundColor: '$backgroundLight',
  borderRadius: '$1',
  padding: '$2 $3',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  color: '$textDark',
  fontSize: '$3',
  lineHeight: '1.8',
});

const TooltipLabel = styled('p', {
  margin: 0,
  fontWeight: '$5',
  marginBottom: '$1',
  borderBottom: '1px solid $border',
  paddingBottom: '$1',
});

const TooltipItem = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$1',
});

const TooltipDot = styled('span', {
  display: 'inline-block',
  width: '10px',
  height: '10px',
  borderRadius: '$round',
});

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <ChartTooltipWrapper>
      <TooltipLabel>{label}</TooltipLabel>
      {payload.map((entry) => (
        <TooltipItem key={entry.dataKey}>
          <TooltipDot css={{ backgroundColor: entry.color }} />
          <span>
            {entry.name}: {entry.value.toLocaleString('en-US')}
          </span>
        </TooltipItem>
      ))}
    </ChartTooltipWrapper>
  );
};

const RANGE_PRESETS = [
  { label: '30d', days: 30 },
  { label: '3mo', days: 90 },
  { label: '6mo', days: 180 },
  { label: '1y', days: 365 },
];

const getPresetRange = (days) => {
  const end = new Date().toISOString();
  const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  return { start, end };
};

const detectActivePreset = (range) => {
  if (!range.start || !range.end) return null;
  const endMs = new Date(range.end).getTime();
  const startMs = new Date(range.start).getTime();
  const diffDays = Math.round((endMs - startMs) / (24 * 60 * 60 * 1000));
  for (const preset of RANGE_PRESETS) {
    if (Math.abs(diffDays - preset.days) <= 2) return preset.label;
  }
  return null;
};

const formatDate = (isoStr) => {
  const d = new Date(isoStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const toInputDate = (isoStr) => {
  if (!isoStr) return '';
  return new Date(isoStr).toISOString().split('T')[0];
};

const GrowthTrends = () => {
  const dispatch = useDispatch();
  const history = useSelector(selectHistory);
  const historyRange = useSelector(selectHistoryRange);
  const activePreset = detectActivePreset(historyRange);

  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const handlePresetClick = useCallback(
    (days) => {
      setShowCustom(false);
      const range = getPresetRange(days);
      dispatch(setHistoryRange({ ...range }));
    },
    [dispatch],
  );

  const handleCustomApply = useCallback(() => {
    if (customStart && customEnd) {
      dispatch(
        setHistoryRange({
          start: new Date(customStart).toISOString(),
          end: new Date(customEnd).toISOString(),
        }),
      );
    }
  }, [dispatch, customStart, customEnd]);

  const data = history.map((snapshot) => ({
    date: formatDate(snapshot.snapshotDate),
    'Total Images': snapshot.platform.totalImages,
    'Total Projects': snapshot.platform.totalProjects,
    'Total Users': snapshot.platform.totalUsers,
  }));

  return (
    <Section>
      <SectionHeader>
        <SectionTitle>Growth Trends</SectionTitle>
        <RangeControls>
          {RANGE_PRESETS.map((preset) => (
            <RangeButton
              key={preset.label}
              active={!showCustom && activePreset === preset.label}
              onClick={() => handlePresetClick(preset.days)}
            >
              {preset.label}
            </RangeButton>
          ))}
          {/* <RangeButton active={showCustom} onClick={() => setShowCustom(true)}>
            Custom
          </RangeButton> */}
        </RangeControls>
      </SectionHeader>
      {showCustom && (
        <CustomDateInputs>
          <DateInput
            type="date"
            value={customStart || toInputDate(historyRange.start)}
            onChange={(e) => setCustomStart(e.target.value)}
          />
          <span>to</span>
          <DateInput
            type="date"
            value={customEnd || toInputDate(historyRange.end)}
            onChange={(e) => setCustomEnd(e.target.value)}
          />
          <ApplyButton onClick={handleCustomApply}>Apply</ApplyButton>
        </CustomDateInputs>
      )}
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(tick) => tick.toLocaleString('en-US')} />
            <Tooltip content={<ChartTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="Total Images"
              stroke={indigo.indigo11}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="Total Projects"
              stroke={green.green11}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="Total Users"
              stroke={orange.orange11}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p style={{ color: 'var(--colors-textLight)', textAlign: 'center', padding: '40px 0' }}>
          No history data available for the selected range.
        </p>
      )}
    </Section>
  );
};

export default GrowthTrends;
