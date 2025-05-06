import React, { useEffect, useState } from 'react';
import { styled } from '../../theme/stitches.config.js';
import {
  ChatBubbleIcon,
  Cross2Icon,
} from '@radix-ui/react-icons';
import { 
  hasRole,
  READ_COMMENT_ROLES,
  WRITE_COMMENT_ROLES,
} from '../auth/roles.js';
import {
  Tooltip,
  TooltipContent,
  TooltipArrow,
  TooltipTrigger,
} from '../../components/Tooltip.jsx';
import {
  Root as PopoverRoot,
  PopoverPortal,
  PopoverContent,
  PopoverTrigger,
  PopoverArrow,
  PopoverClose,
} from '@radix-ui/react-popover';
import { ToolbarIconButton } from './ImageReviewToolbar.jsx';
import { CommentsContent } from './CommentsContent.jsx';
import { indigo } from '@radix-ui/colors';

const Badge = styled('div', {
  position: 'absolute',
  top: 1,
  left: 18,
  background: indigo.indigo4,
  fontSize: '$1',
  fontWeight: '$5',
  color: indigo.indigo11,
  padding: '2px $1',
  borderRadius: '$2',
});

const StyledPopoverContent = styled(PopoverContent, {
  zIndex: '$4',
  '&:--radix-popover-content-transform-origin': '0px'
});

const StyledPopoverArrow = styled(PopoverArrow, {
  zIndex: 200,
  fill: '$backgroundLight',
});

const StyledPopoverClose = styled(PopoverClose, {
  alignItems: 'center',
  display: 'inline-flex',
  position: 'absolute',
  right: '0',
  justifyContent: 'center',
  lineHeight: '1',
  backgroundColor: '$backgroundLight',
  border: 'none',
  borderRadius: '$round',
  height: '$5',
  width: '$5',
  margin: '0 $2',
  '&:hover': {
    cursor: 'pointer',
    backgroundColor: '$gray4',
  },
});

export const CommentsPopover = ({ 
  image,
  userRoles,
}) => {
  const [isCommentsPopoverOpen, setIsCommentsPopoverOpen] = useState(false);
  const [isCommentsActionMenuOpen, setIsCommentsActionMenuOpen] = useState(false);
  const onClickOutsideComments = () => {
    if (!isCommentsActionMenuOpen) {
      setIsCommentsPopoverOpen(false);
    }
  };

  // Close popover when changing images using keyboard
  useEffect(() => {
    setIsCommentsPopoverOpen(false);
  }, [image]);

  return (
    <Tooltip>
      <PopoverRoot open={isCommentsPopoverOpen}>
        <TooltipTrigger
          asChild
          disabled={
            !hasRole(userRoles, READ_COMMENT_ROLES) ||
            !hasRole(userRoles, WRITE_COMMENT_ROLES)
          }
        >
          <PopoverTrigger asChild onClick={() => setIsCommentsPopoverOpen(true)}>
            <ToolbarIconButton css={{ position: 'relative' }}>
              <ChatBubbleIcon />
              {image.comments?.length > 0 && <Badge>{image.comments?.length}</Badge>}
            </ToolbarIconButton>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={5}>
          Add comments
          <TooltipArrow />
        </TooltipContent>
        <PopoverPortal>
          <StyledPopoverContent
            side="top"
            sideOffset={25}
            onPointerDownOutside={() => onClickOutsideComments()}
          >
            <CommentsContent
              onChangeActionMenu={setIsCommentsActionMenuOpen}
              comments={image.comments}
              imageId={image._id}
              closeContent={
                <StyledPopoverClose 
                  onClick={() => setIsCommentsPopoverOpen(false)}
                >
                  <Cross2Icon />
                </StyledPopoverClose>
              }
            />
            <StyledPopoverArrow />
          </StyledPopoverContent>
        </PopoverPortal>
      </PopoverRoot>
    </Tooltip>
  );
};
