import React from 'react';
import { styled } from '../theme/stitches.config';
import { Box } from './Box';

const Header = styled('div', {
  fontSize: '42px',
  fontWeight: '$5',
  fontFamily: '$roboto',
  color: '$textDark',
  textAlign: 'center',
  paddingTop: '$8',
  paddingBottom: '$8',
});

export const NotFound = () => {
  return (
    <Box>
      <Header>Page not found</Header>
    </Box>
  );
};
