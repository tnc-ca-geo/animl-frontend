import React from 'react';
import { styled } from '../../theme/stitches.config';

const Container = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  placeItems: 'center',
  backgroundColor: '$backgroundDark',
  height: '100%',
  width: '100%',
});

const Line = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontWeight: '$3',
  '@bp2': {
    fontSize: '$5',
  },
});

const NotFoundText = styled('div', {
  '&::after': {
    content: '\\1F400',
    paddingLeft: '$2',
    fontSize: '30px',
  },
});

export const RatsNoneFound = () => {
  return (
    <Container>
      <Line>
        Rats!
        <NotFoundText />
      </Line>
      <Line>We couldn&apos;t find any matching images.</Line>
    </Container>
  );
};
