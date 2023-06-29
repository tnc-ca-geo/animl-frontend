import React from 'react';
import { styled } from '../theme/stitches.config.js';

const Crumb = styled('span', {
  paddingRight: '$4',
});

const BreadcrumbContainer = styled('div', {
  boxSizing: 'border-box',
  display: 'flex',
  fontSize: '$4',
  fontWeight: '$5',
});

const Breadcrumbs = () => {
  return (
    <BreadcrumbContainer>
      <Crumb>
        Santa Cruz Island
      </Crumb>
      <Crumb>
        Biosecurity network
      </Crumb>
    </BreadcrumbContainer>
  )
};

export default Breadcrumbs;