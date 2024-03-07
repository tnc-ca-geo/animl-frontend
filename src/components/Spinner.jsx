import React from 'react';
import { styled, keyframes } from '../theme/stitches.config.js';

const pulse = keyframes({
  '0%': {
    transform: 'scale(0)',
  },
  '100%': {
    transform: 'scale(1)',
    opacity: '0',
  },
});

const PulseCircle = styled('div', {
  width: '$10',
  height: '$10',
  backgroundColor: '$gray5',
  borderRadius: '100%',
  animation: `${pulse} 1.2s infinite cubic-bezier(0.455, 0.03, 0.515, 0.955)`,
  // width: '40px',
  // height: '40px',
  // backgroundColor: 'wheat',
  // '&:hover': {
  //   animation: `${rotate} 1s infinite linear`,
  // },
});

export const PulseSpinner = () => <PulseCircle className="spinner" />;

const circleAnimation = keyframes({
  '0%, 80%, 100%': {
    transform: 'scale(0)',
  },
  '40%': {
    transform: 'scale(1)',
  },
});

const Circle = styled('div', {
  width: '$6',
  height: '$6',
  position: 'relative',
});

const CircleDot = styled('div', {
  width: '100%',
  height: '100%',
  position: 'absolute',
  left: '0',
  top: '0',

  '&::before': {
    content: "''",
    display: 'block',
    width: '15%',
    height: '15%',
    backgroundColor: '$hiContrast',
    borderRadius: '100%',
    animation: `${circleAnimation} 1.2s infinite ease-in-out both`,
  },

  '&:nth-child(1)': { transform: 'rotate(30deg)' },
  '&:nth-child(2)': { transform: 'rotate(60deg)' },
  '&:nth-child(3)': { transform: 'rotate(90deg)' },
  '&:nth-child(4)': { transform: 'rotate(120deg)' },
  '&:nth-child(5)': { transform: 'rotate(150deg)' },
  '&:nth-child(6)': { transform: 'rotate(180deg)' },
  '&:nth-child(7)': { transform: 'rotate(210deg)' },
  '&:nth-child(8)': { transform: 'rotate(240deg)' },
  '&:nth-child(9)': { transform: 'rotate(270deg)' },
  '&:nth-child(10)': { transform: 'rotate(300deg)' },
  '&:nth-child(11)': { transform: 'rotate(330deg)' },
  '&:nth-child(1):before': { animationDelay: '-1.1s' },
  '&:nth-child(2):before': { animationDelay: '-1s' },
  '&:nth-child(3):before': { animationDelay: '-0.9s' },
  '&:nth-child(4):before': { animationDelay: '-0.8s' },
  '&:nth-child(5):before': { animationDelay: '-0.7s' },
  '&:nth-child(6):before': { animationDelay: '-0.6s' },
  '&:nth-child(7):before': { animationDelay: '-0.5s' },
  '&:nth-child(8):before': { animationDelay: '-0.4s' },
  '&:nth-child(9):before': { animationDelay: '-0.3s' },
  '&:nth-child(10):before': { animationDelay: '-0.2s' },
  '&:nth-child(11):before': { animationDelay: '-0.1s' },
});

export const CircleSpinner = () => (
  <Circle className="spinner">
    <CircleDot />
    <CircleDot />
    <CircleDot />
    <CircleDot />
    <CircleDot />
    <CircleDot />
    <CircleDot />
    <CircleDot />
    <CircleDot />
    <CircleDot />
    <CircleDot />
    <CircleDot />
  </Circle>
);

const spin = keyframes({
  '100%': { transform: 'rotate(360deg)' },
});

const StyledSVG = styled('svg', {
  color: '$blue500',
  opacity: 0,
  verticalAlign: 'middle',
  animation: `${spin} 1.2s infinite linear both`,
  variants: {
    size: {
      sm: { width: '20px' },
      md: { width: '30px' },
      lg: { width: '40px' },
    },
    display: {
      true: {
        opacity: 0.4,
      },
    },
  },
});

export const SimpleSpinner = ({ size = 'sm', display = true }) => (
  <StyledSVG
    size={size}
    display={display}
    className="spinner"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    preserveAspectRatio="xMidYMid meet"
  >
    <g fill="none" fillRule="evenodd" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="11" opacity="0.3"></circle>
      <path d="M12 1c2.8 0 5.6 1.1 7.8 3.2 4.3 4.3 4.3 11.3 0 15.6s-11.3 4.3-15.6 0"></path>
    </g>
  </StyledSVG>
);

export const SpinnerOverlay = styled('div', {
  position: 'absolute',
  backgroundColor: '#f4f5f59e',
  width: '100%',
  height: '100%',
  left: '0',
  top: '0',
  zIndex: '$2',

  '.spinner': {
    position: 'absolute',
    top: 'calc(50% - 12px)',
    left: 'calc(50% - 12px)',
  },
});
