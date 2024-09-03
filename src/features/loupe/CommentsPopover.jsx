import React, { useEffect, useState } from 'react';
import { Cross2Icon } from '@radix-ui/react-icons';
import { styled } from '../../theme/stitches.config.js';
import { PopoverClose } from '@radix-ui/react-popover';
import Button from '../../components/Button.jsx';
import { Comment } from './Comment.jsx';

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
  changeActionMenuState,
  onClose,
  comments
}) => {
  // TODO
  // remove when implementing actual comments functionality
  comments = [
    {
      author: "jesse.leung@tnc.org",
      time: "08/28/24 23:19",
      comment: "A better understanding of usage can aid in prioritizing future efforts.  I'm sorry I replied to your emails after three weeks."
    },
    // {
    //   author: "jesse.leung-aws@tnc.org",
    //   time: "08/28/24 23:20",
    //   comment: "A better understanding of usage can aid in prioritizing future efforts.  I'm sorry I replied to your emails after three weeks."
    // },
    // {
    //   author: "jesse.leung@tnc.org",
    //   time: "08/28/24 23:19",
    //   comment: "A better understanding of usage can aid in prioritizing future efforts.  I'm sorry I replied to your emails after three weeks."
    // },
    // {
    //   author: "jesse.leung-aws@tnc.org",
    //   time: "08/28/24 23:20",
    //   comment: "A better understanding of usage can aid in prioritizing future efforts.  I'm sorry I replied to your emails after three weeks."
    // },
  ]

  return (
    <StyledContent>
      <StyledHeader>
        Comments
        <StyledPopoverClose onClick={() => onClose()}>
          <Cross2Icon />
        </StyledPopoverClose>
      </StyledHeader>
      <StyledCommentsContainer>
      { comments.map((comment) => (
        <Comment 
          key={Math.random()}
          isAuthor={true}
          author={comment.author}
          time={comment.time}
          comment={comment.comment}
        />
      ))}
      </StyledCommentsContainer>
      <StyledAddCommentRow>
        <StyledTextArea
          placeholder='Enter comment'
          onKeyDown={(e) => e.stopPropagation()}
          onKeyDownCapture={(e) => e.stopPropagation()}
        />
        <StyledAddCommentButton size="small">Add Comment</StyledAddCommentButton>
      </StyledAddCommentRow>
    </StyledContent>
  );
}
