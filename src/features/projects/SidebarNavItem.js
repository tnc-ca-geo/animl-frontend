import React from 'react';
import { styled } from '../../theme/stitches.config.js';
import IconButton from '../../components/IconButton';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipArrow, 
  TooltipTrigger
} from '../../components/Tooltip';


const MenuButton = styled(IconButton, {
  fontSize: '$4',
  margin: '$2',
  borderRadius: '$2',
});


const SidebarNavItem = (props) => {
  const { state, disabled, handleClick, icon, tooltipContent } = props;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <MenuButton
          variant='ghost'
          disabled={disabled}
          state={state}
          onClick={handleClick}
        >
          {icon}
        </MenuButton>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={5} >
        {tooltipContent}
        <TooltipArrow />
      </TooltipContent>
    </Tooltip>
  );
};


export default SidebarNavItem;
