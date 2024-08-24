import React from 'react';
import { 
  Cross2Icon,
} from '@radix-ui/react-icons';
import { FieldRow } from '../../components/Form.jsx';
import { styled } from '../../theme/stitches.config.js';
import { PopoverClose } from '@radix-ui/react-popover';

const StyledFieldRow = styled(FieldRow, {
  display: 'block',
});

const StyledContent = styled('div', {
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

const StyledAvatar = styled('div', {
  border: 'none',
  borderRadius: '$round',
  height: '$5',
  width: '$5',
  backgroundColor: '$backgroundExtraDark',
  fontWeight: 'bold',
  display: 'grid',
  placeItems: 'center',
  lineHeight: '$5',
  marginTop: 'auto',
  marginBottom: 'auto'
});

const StyledNameRow = styled('div', {
  display: 'flex',
  gap: '$3',
  marginBottom: '$2'
})

const StyledNameField = styled('div', {
  display: 'flex',
  flexDirection: 'column',
});

const StyledName = styled('div', {
  fontWeight: 'bold',
  lineHeight: '1.2'
});

const StyledCommentTime = styled('div', {
  color: '$textLight',
  fontSize: '$2',
});

export const CommentsPopover = ({
  comments
}) => {
  comments = ["A better understanding of usage can aid in prioritizing future efforts.  I'm sorry I replied to your emails after three weeks.", "comment 2"]
  return (
    <StyledContent>
      <StyledHeader>
        Comments
        <StyledPopoverClose>
          <Cross2Icon />
        </StyledPopoverClose>
      </StyledHeader>
      { comments.map((cmt) => (
        <StyledFieldRow key={Math.random()}>
          <StyledNameRow>
            <StyledAvatar>
              JL
            </StyledAvatar>
            <StyledNameField>
              <StyledName>Jesse Leung</StyledName>
              <StyledCommentTime>27 minutes ago</StyledCommentTime>
            </StyledNameField>
          </StyledNameRow>
        { cmt }
        </StyledFieldRow>
      ))}
    </StyledContent>
  );
}
