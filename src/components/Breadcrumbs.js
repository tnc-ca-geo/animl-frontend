import React from 'react';
import { styled } from '../theme/stitches.config.js';

const Crumb = styled.span({
  paddingRight: '$4',
});

const BreadcrumbContainer = styled.div({
  boxSizing: 'border-box',
  display: 'flex',
  fontSize: '$5',
  fontWeight: '$4',
});

const Breadcrumbs = () => {
  return (
    <BreadcrumbContainer>
      <Crumb>
        tnc-ca
      </Crumb>
      <Crumb>
        sci
      </Crumb>
      <Crumb>
        biosecurity cameras
      </Crumb>
    </BreadcrumbContainer>
  )
};

export default Breadcrumbs;