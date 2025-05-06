import React, { useEffect, useRef, useState } from 'react';
import { styled } from '../../theme/stitches.config.js';
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
  '@bp1': {
    width: '450px',
    boxShadow: 'hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px',
  },
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

const StyledAddCommentRow = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '$backgroundLight',
  fontWeight: '$5',
  color: '$textDark',
  padding: '$3',
  '@bp1': {
    borderBottomLeftRadius: '$2',
    borderBottomRightRadius: '$2',
  },
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

export const CommentsContent = ({ 
  comments, 
  imageId, 
  onChangeActionMenu,
  closeContent,
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

  // Add comment using enter
  // Shift + Enter makes a new line
  const [isShiftDown, setIsShiftDown] = useState(false);
  const handleKeyDown = (event) => {
    event.stopPropagation();
    if (event.key === 'Shift') {
      setIsShiftDown(true);
    }
    if (event.key === 'Enter' && !isShiftDown) {
      handleAddComment(addCommentText);
      event.preventDefault();
    }
  };
  const handleKeyUp = (event) => {
    if (event.key === 'Shift') {
      setIsShiftDown(false);
    }
  };
  // Scroll to bottom when adding a new comment
  const scrollRef = useRef();
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments]);

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
          { closeContent }
        </StyledHeader>
        {comments?.length > 0 && (
          <StyledCommentsContainer>
            {comments.map((comment, idx) => (
              <Comment
                key={comment._id}
                comment={comment}
                imageId={imageId}
                onChangeOpen={onChangeActionMenu}
                scrollRef={idx === comments.length - 1 ? scrollRef : undefined}
              />
            ))}
          </StyledCommentsContainer>
        )}
        <StyledAddCommentRow css={{ borderTop: comments?.length ? '1px solid $border' : 'none' }}>
          <StyledTextArea
            value={addCommentText}
            onChange={(e) => setAddCommentText(e.target.value)}
            placeholder="Enter comment"
            onKeyDown={(e) => handleKeyDown(e)}
            onKeyUp={(e) => handleKeyUp(e)}
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
