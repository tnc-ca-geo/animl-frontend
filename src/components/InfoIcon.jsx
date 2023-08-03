import React from 'react';
import { styled } from '../theme/stitches.config.js';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipArrow, 
  TooltipTrigger
} from './Tooltip.jsx';
import { InfoCircledIcon } from '@radix-ui/react-icons';

const Icon = styled(InfoCircledIcon, {
  marginLeft: '$2'
});

const InfoIcon = ({ tooltipContent, side }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Icon />
      </TooltipTrigger>
      <TooltipContent side={side || 'right'} sideOffset={5} >
        {tooltipContent}
        <TooltipArrow />
      </TooltipContent>
    </Tooltip>
  );
};

export default InfoIcon;
