import React from 'react';
import { styled, css } from '../theme/stitches.config.js';

const pulse = css.keyframes({
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
  backgroundColor: '$gray400',
  borderRadius: '100%',
  animation: `${pulse} 1.2s infinite cubic-bezier(0.455, 0.03, 0.515, 0.955)`,
  // width: '40px',
  // height: '40px',
  // backgroundColor: 'wheat',
  // ':hover': {
  //   animation: `${rotate} 1s infinite linear`,
  // },
});

export const PulseSpinner = () => (
  <PulseCircle className='spinner' />
)

const circleAnimation = css.keyframes({
  '0%, 80%, 100%': {
    transform: 'scale(0)',
  },
  '40%': {
    transform: 'scale(1)',
  } 
})

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
  
  '::before': {
    content: "''",
    display: 'block',
    width: '15%',
    height: '15%',
    backgroundColor: '$gray400',
    borderRadius: '100%',
    animation:  `${circleAnimation} 1.2s infinite ease-in-out both`,
  },

  ':nth-child(1)': { transform: 'rotate(30deg)' },
  ':nth-child(2)': { transform: 'rotate(60deg)' },
  ':nth-child(3)': { transform: 'rotate(90deg)' },
  ':nth-child(4)': { transform: 'rotate(120deg)' },
  ':nth-child(5)': { transform: 'rotate(150deg)' },
  ':nth-child(6)': { transform: 'rotate(180deg)' },
  ':nth-child(7)': { transform: 'rotate(210deg)' },
  ':nth-child(8)': { transform: 'rotate(240deg)' },
  ':nth-child(9)': { transform: 'rotate(270deg)' },
  ':nth-child(10)': { transform: 'rotate(300deg)' },
  ':nth-child(11)': { transform: 'rotate(330deg)' },
  ':nth-child(1):before': { animationDelay: '-1.1s' },
  ':nth-child(2):before': { animationDelay: '-1s' },
  ':nth-child(3):before': { animationDelay: '-0.9s' },
  ':nth-child(4):before': { animationDelay: '-0.8s' },
  ':nth-child(5):before': { animationDelay: '-0.7s' },
  ':nth-child(6):before': { animationDelay: '-0.6s' },
  ':nth-child(7):before': { animationDelay: '-0.5s' },
  ':nth-child(8):before': { animationDelay: '-0.4s' },
  ':nth-child(9):before': { animationDelay: '-0.3s' },
  ':nth-child(10):before': { animationDelay: '-0.2s' },
  ':nth-child(11):before': { animationDelay: '-0.1s' },
});

export const CircleSpinner = () => (
  <Circle className='spinner'>
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

export const SpinnerOverlay = styled('div', {
  position: 'absolute',
  backgroundColor: '#f4f5f59e',
  width: '100%',
  height: '100%',
  left: '0',
  top: '0',

  '.spinner': {
    position: 'absolute',
    top: 'calc(50% - 36px)',
    left: 'calc(50% - 36px)',
  }
});
