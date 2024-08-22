import {
  Root as PopoverRoot,
  PopoverTrigger,
  PopoverPortal,
  PopoverContent,
  PopoverClose,
  PopoverArrow
} from '@radix-ui/react-popover';
import { 
  Cross2Icon,
  ChatBubbleIcon
} from '@radix-ui/react-icons';
import { FieldRow } from '../../components/Form.jsx';
import { styled } from '../../theme/stitches.config.js';

const StyledFieldRow = styled(FieldRow, {
  display: 'block',
});

const StyledPopoverPortal = styled(PopoverPortal, {
  marginBottom: '100px'
})

const StyledPopoverContent = styled(PopoverContent, {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  backgroundColor: '$loContrast',
  borderRadius: '$2',
  width: '350px',
  padding: '$0 $3 $0 $3',
});

const StyledHeader = styled('div', {
  display: 'flex',
  alignItems: 'center',
  height: '$7',
  borderTopLeftRadius: '$2',
  borderTopRightRadius: '$2',
  borderBottom: '1px solid $border',
  backgroundColor: '$backgroundLight',
  fontWeight: '$5',
  color: '$textDark',
});

const StyledPopoverClose = styled(PopoverClose, {
  alignItems: 'center',
  display: 'inline-flex',
  justifyContent: 'center',
  lineHeight: '1',
  backgroundColor: '$backgroundLight',
  border: 'none',
  borderRadius: '$round',
  height: '$5',
  width: '$5',
  marginLeft: 'auto',
  '&:hover': {
    cursor: 'pointer',
    backgroundColor: '$gray4'

  }
});

const StyledPopoverArrow = styled(PopoverArrow, {
  fill: '$backgroundLight'
})

export const CommentsPopover = ({
  comments
}) => {
  comments = ["first comment", "second comment"]
  return (
    <PopoverRoot>
      <PopoverTrigger asChild>
        <ChatBubbleIcon />
      </PopoverTrigger>
      <StyledPopoverPortal>
        <StyledPopoverContent sideOffset={25}>
          <StyledHeader>
            Comments
            <StyledPopoverClose>
              <Cross2Icon />
            </StyledPopoverClose>
          </StyledHeader>
            { comments.map((comment) => (
              <StyledFieldRow key={Math.random()}>
                {comment}
              </StyledFieldRow>
            ))}
          <StyledPopoverArrow />
        </StyledPopoverContent>
      </StyledPopoverPortal>
    </PopoverRoot>
  );
}
