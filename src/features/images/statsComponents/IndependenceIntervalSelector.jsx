import React, { forwardRef } from 'react';
import { styled } from '@stitches/react';
import * as Select from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';

const Trigger = styled(Select.Trigger, {
  all: 'unset',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '$2',
  padding: '0 $3',
  fontSize: '$3',
  lineHeight: '1',
  height: '30px',
  gap: '5px',
  backgroundColor: '$backgroundLight',
  color: '$textDark',
  border: '1px solid $border',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '$gray3',
  },
  '&:focus': {
    transition: 'all 0.2s ease',
    outline: 'none',
    boxShadow: '0 0 0 3px $gray3',
    '&:hover': {
      boxShadow: '0 0 0 3px $blue200',
      borderColor: '$blue500',
    },
  },
  '&[data-placeholder]': {
    color: '$textMedium',
  },
});

const Icon = styled(Select.Icon, {
  color: 'var(--violet-11)',
});

const Content = styled(Select.Content, {
  overflow: 'hidden',
  backgroundColor: 'white',
  borderRadius: '6px',
  zIndex: '$5',
  boxShadow:
    '0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2)',
});

const Viewport = styled(Select.Viewport, {
  padding: '5px',
});

const Item = styled(Select.Item, {
  fontSize: '13px',
  lineHeight: '1',
  color: '$textDark',
  borderRadius: '3px',
  display: 'flex',
  alignItems: 'center',
  height: '25px',
  padding: '0 35px 0 25px',
  position: 'relative',
  userSelect: 'none',
  cursor: 'pointer',
  '&[data-disabled]': {
    color: 'var(--mauve-8)',
    pointerEvents: 'none',
  },
  '&[data-highlighted]': {
    outline: 'none',
    backgroundColor: 'var(--violet-9)',
    color: 'var(--violet-1)',
  },
  '&:hover': {
    backgroundColor: '$gray3',
  },
});

const ItemIndicator = styled(Select.ItemIndicator, {
  position: 'absolute',
  left: '0',
  width: '25px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const ScrollButton = styled(Select.ScrollUpButton, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '25px',
  backgroundColor: 'white',
  color: 'var(--violet-11)',
  cursor: 'default',
});

const TriggerLabel = styled('div', {
  color: '$textDark',
  fontWeight: '$3',
});

const IndependenceIntervalSelector = ({ value, onValueChange }) => {
  console.log('Rendering IndependenceIntervalSelector with value:', value);
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Trigger aria-label="Independence Interval">
        <TriggerLabel>Independence Interval: </TriggerLabel>
        <Select.Value placeholder="Select an interval…" />
        <Icon>
          <ChevronDownIcon />
        </Icon>
      </Trigger>
      <Select.Portal>
        <Content>
          <ScrollButton>
            <ChevronUpIcon />
          </ScrollButton>
          <Viewport>
            <SelectItem value={1}>1 min</SelectItem>
            <SelectItem value={2}>2 min</SelectItem>
            <SelectItem value={30}>30 min</SelectItem>
            <SelectItem value={60}>60 min</SelectItem>
          </Viewport>
          <ScrollButton>
            <ChevronDownIcon />
          </ScrollButton>
        </Content>
      </Select.Portal>
    </Select.Root>
  );
};

const SelectItem = forwardRef(function SelectItem({ children, ...props }, forwardedRef) {
  return (
    <Item {...props} ref={forwardedRef}>
      <Select.ItemText>{children}</Select.ItemText>
      <ItemIndicator>
        <CheckIcon />
      </ItemIndicator>
    </Item>
  );
});

export default IndependenceIntervalSelector;
