import React from 'react';
import { styled } from '../theme/stitches.config';
import {
  InfoCircledIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  ExclamationTriangleIcon,
} from '@radix-ui/react-icons';

const StyledAlert = styled('div', {
  marginTop: '$2',
  marginBottom: '$3',
  padding: '$1 $3',
  color: '$textMedium',
  borderLeft: '4px solid',
  borderRadius: '$1',
  backgroundColor: '$backgroundDark',

  p: {
    marginTop: '$2',
  },
  variants: {
    type: {
      info: {
        color: '$infoText',
        // background: '$infoBg',
        borderColor: '$infoBorder',
      },
      success: {
        color: '$successText',
        // background: '$successBg',
        borderColor: '$successBorder',
      },
      warning: {
        color: '$warningText',
        // background: '$warningBg',
        borderColor: '$warningBorder',
      },
      error: {
        color: '$errorText',
        // background: '$errorBg',
        borderColor: '$errorBorder',
      },
    },
  },
});

const AlertTitle = styled('div', {
  display: 'flex',
  alignItems: 'center',
  fontWeight: '500',
  marginTop: '$2',
  svg: {
    marginRight: '$2',
  },
});

const Alert = ({ type, title, children }) => {
  const icon = () => {
    if (type === 'info') {
      return <InfoCircledIcon />;
    } else if (type === 'success') {
      return <CheckCircledIcon />;
    } else if (type === 'error') {
      return <CrossCircledIcon />;
    } else {
      return <ExclamationTriangleIcon />;
    }
  };

  const titleMap = {
    info: 'Note',
    success: 'Success',
    warning: 'Warning',
    error: 'Error',
  };

  return (
    <StyledAlert type={type || 'warning'}>
      <AlertTitle>
        {icon()}
        {title || titleMap[type]}
      </AlertTitle>
      {children}
    </StyledAlert>
  );
};

export default Alert;
