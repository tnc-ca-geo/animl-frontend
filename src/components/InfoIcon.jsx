import React from 'react';
import { styled } from '../theme/stitches.config.js';
import { Tooltip, TooltipContent, TooltipArrow, TooltipTrigger } from './Tooltip.jsx';
import { InfoCircledIcon } from '@radix-ui/react-icons';

const Icon = styled(InfoCircledIcon, {
  marginLeft: '$2',
});

const InfoIcon = ({ tooltipContent, side, maxWidth }) => {
  const StyledTooltipContent = styled(TooltipContent, {
    maxWidth: maxWidth || null,
    margin: '0px 15px',
    color: 'white',
    p: {
      color: 'white',
    },
  });

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Icon />
      </TooltipTrigger>
      <StyledTooltipContent side={side || 'right'} sideOffset={5}>
        {tooltipContent}
        <TooltipArrow />
      </StyledTooltipContent>
    </Tooltip>
  );
};

export default InfoIcon;
