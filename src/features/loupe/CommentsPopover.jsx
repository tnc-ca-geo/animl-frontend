import React from 'react';
import { 
  Cross2Icon,
} from '@radix-ui/react-icons';
import { FieldRow } from '../../components/Form.jsx';
import { styled } from '../../theme/stitches.config.js';
import { PopoverClose } from '@radix-ui/react-popover';
import Button from '../../components/Button.jsx';

const StyledFieldRow = styled(FieldRow, {
  display: 'block',
  paddingBottom: '$3'
});

const StyledCommentsContainer = styled('div', {
  overflowY: 'scroll'
});

const StyledContent = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  backgroundColor: '$loContrast',
  borderRadius: '$2',
  width: '450px',
  maxHeight: '70vh',
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
  paddingTop: '$2',
  paddingBottom: '$2'
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
  lineHeight: '1.1'
});

const StyledCommentTime = styled('div', {
  color: '$textLight',
  fontSize: '$2',
});

const StyledComment = styled('div', {
  fontSize: '$3'
});

const StyledAddCommentRow = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$1',
  borderBottomLeftRadius: '$2',
  borderBottomRightRadius: '$2',
  borderTop: '1px solid $border',
  backgroundColor: '$backgroundLight',
  fontWeight: '$5',
  color: '$textDark',
  paddingTop: '$2',
  paddingBottom: '$2',
});

const StyledTextArea = styled('textarea', {
  resize: 'none',
  width: '100%',
  rows: '2',
  color: '$textDark',
  padding: '$1',
  fontSize: '$3',
  fontWeight: '$2',
  boxSizing: 'border-box',
  border: '1px solid',
  borderColor: '$border',
  backgroundColor: '#FFFFFF',
  borderRadius: '$1',
  '&:focus': {
    transition: 'all 0.2s ease',
    outline: 'none',
    boxShadow: '0 0 0 3px $gray3',
    // borderColor: '$textDark',
    '&:hover': {
      boxShadow: '0 0 0 3px $blue200',
      borderColor: '$blue500',
    },
  },
});

const StyledAddCommentButton = styled(Button, {
  marginLeft: 'auto',
  marginRight: '0',
});


export const CommentsPopover = ({
  comments
}) => {
  // TODO
  // remove when implementing actual comments functionality
  comments = [
    "A better understanding of usage can aid in prioritizing future efforts.  I'm sorry I replied to your emails after three weeks.", 
    "A better understanding of usage can aid in prioritizing future efforts.  I'm sorry I replied to your emails after three weeks.", 
    "A better understanding of usage can aid in prioritizing future efforts.  I'm sorry I replied to your emails after three weeks.", 
    "A better understanding of usage can aid in prioritizing future efforts.  I'm sorry I replied to your emails after three weeks.", 
    "A better understanding of usage can aid in prioritizing future efforts.  I'm sorry I replied to your emails after three weeks.", 
    "A better understanding of usage can aid in prioritizing future efforts.  I'm sorry I replied to your emails after three weeks.", 
    "A better understanding of usage can aid in prioritizing future efforts.  I'm sorry I replied to your emails after three weeks.", 
    // "A better understanding of usage can aid in prioritizing future efforts.  I'm sorry I replied to your emails after three weeks.", 
    // "A better understanding of usage can aid in prioritizing future efforts.  I'm sorry I replied to your emails after three weeks.", 
    "comment 2"
  ]
  return (
    <StyledContent>
      <StyledHeader>
        Comments
        <StyledPopoverClose>
          <Cross2Icon />
        </StyledPopoverClose>
      </StyledHeader>
      <StyledCommentsContainer>
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
            <StyledComment>
              { cmt }
            </StyledComment>
        </StyledFieldRow>
      ))}
      </StyledCommentsContainer>
      <StyledAddCommentRow>
        <StyledTextArea
          placeholder='Enter comment'
        >
        </StyledTextArea>
        <StyledAddCommentButton size="small">Add Comment</StyledAddCommentButton>
      </StyledAddCommentRow>
    </StyledContent>
  );
}
