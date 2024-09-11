import React, { useState } from 'react';
import { Cross2Icon } from '@radix-ui/react-icons';
import { styled } from '../../theme/stitches.config.js';
import { PopoverClose } from '@radix-ui/react-popover';
import Button from '../../components/Button.jsx';
import { Comment } from './Comment.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { editComment, selectCommentsLoading } from '../review/reviewSlice.js';
import { SimpleSpinner, SpinnerOverlay } from '../../components/Spinner.jsx';

const StyledCommentsContainer = styled('div', {
  overflowY: 'scroll',
  padding: '$3 $3',
});

const StyledContent = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '$loContrast',
  borderRadius: '$2',
  boxShadow: 'hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px',
  width: '450px',
  maxHeight: '70vh',
});

const StyledHeader = styled('div', {
  display: 'flex',
  alignItems: 'center',
  borderTopLeftRadius: '$2',
  borderTopRightRadius: '$2',
  borderBottom: '1px solid $border',
  backgroundColor: '$backgroundLight',
  fontWeight: '$5',
  color: '$textDark',
  padding: '$0 $3',
  minHeight: '$7',
  position: 'relative',
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

const StyledAddCommentRow = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  borderBottomLeftRadius: '$2',
  borderBottomRightRadius: '$2',
  backgroundColor: '$backgroundLight',
  fontWeight: '$5',
  color: '$textDark',
  padding: '$3',
});

const StyledTextArea = styled('textarea', {
  resize: 'none',
  width: '100%',
  rows: '2',
  color: '$textDark',
  marginBottom: '$3',
  padding: '$3',
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
  onClose, 
  comments, 
  imageId, 
  onChangeActionMenu 
}) => {
  const dispatch = useDispatch();
  const commentsLoading = useSelector(selectCommentsLoading);
  const [addCommentText, setAddCommentText] = useState('');
  const handleAddComment = (commentText) => {
    const addCommentDto = {
      comment: commentText,
      imageId: imageId,
    };
    dispatch(editComment('create', addCommentDto));
    setAddCommentText('');
  };

  return (
    <>
      {commentsLoading && (
        <SpinnerOverlay>
          <SimpleSpinner />
        </SpinnerOverlay>
      )}
      <StyledContent>
        <StyledHeader>
          Comments
          <StyledPopoverClose onClick={() => onClose()}>
            <Cross2Icon />
          </StyledPopoverClose>
        </StyledHeader>
        {comments.length > 0 && (
          <StyledCommentsContainer>
            {comments.map((comment) => (
              <Comment 
                key={comment._id} 
                comment={comment} 
                imageId={imageId} 
                onChangeOpen={onChangeActionMenu}
              />
            ))}
          </StyledCommentsContainer>
        )}
        <StyledAddCommentRow css={{ borderTop: comments.length ? '1px solid $border' : 'none' }}>
          <StyledTextArea
            value={addCommentText}
            onChange={(e) => setAddCommentText(e.target.value)}
            placeholder="Enter comment"
            onKeyDown={(e) => e.stopPropagation()}
            onKeyDownCapture={(e) => e.stopPropagation()}
          />
          <StyledAddCommentButton
            size="small"
            onClick={() => handleAddComment(addCommentText)}
            disabled={addCommentText === ''}
          >
            Add Comment
          </StyledAddCommentButton>
        </StyledAddCommentRow>
      </StyledContent>
    </>
  );
};
