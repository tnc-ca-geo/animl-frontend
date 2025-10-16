import React from 'react';
import { styled } from '@stitches/react';
import InfoIcon from '../../../components/InfoIcon';

const Content = styled('div', {
  maxWidth: '300px',
  lineHeight: '17px',
});

const Heading = ({ label, content }) => (
  <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '10px' }}>
    <label style={{ display: 'flex', alignItems: 'center' }}>
      {label}
      <InfoIcon side="right" tooltipContent={<Content>{content}</Content>} />
    </label>
  </div>
);

export default Heading;
