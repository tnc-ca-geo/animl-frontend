import React from 'react';
import { styled } from '../theme/stitches.config.js';
import { Tooltip, TooltipContent, TooltipArrow, TooltipTrigger } from './Tooltip.jsx';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { useSelector } from 'react-redux';
import { selectGlobalBreakpoint } from '../features/projects/projectsSlice.js';
import { globalBreakpoints } from '../config.js';
import { Popover, PopoverArrow, PopoverTrigger } from '@radix-ui/react-popover';
import { PopoverContent } from './TooltipPopover.jsx';

const Icon = styled(InfoCircledIcon, {
  marginLeft: '$2',
});

const InfoIcon = ({ tooltipContent, side }) => {
  const currentBreakpoint = useSelector(selectGlobalBreakpoint);
  const isSmallScreen = globalBreakpoints.lessThanOrEqual(currentBreakpoint, 'xs');

  return (
    <>
      {isSmallScreen ? (
        <Popover>
          <PopoverTrigger asChild>
            <Icon />
          </PopoverTrigger>
          <PopoverContent side={side || 'right'} sideOffset={5}>
            {tooltipContent}
            <PopoverArrow />
          </PopoverContent>
        </Popover>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <Icon />
          </TooltipTrigger>
          <TooltipContent side={side || 'right'} sideOffset={5}>
            {tooltipContent}
            <TooltipArrow />
          </TooltipContent>
        </Tooltip>
      )}
    </>
  );
};

export default InfoIcon;
