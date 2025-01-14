import React, { useState, Fragment } from 'react';
import { FieldRow } from '../../components/Form.jsx';
import { styled } from '../../theme/stitches.config.js';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIconLeft,
  DropdownMenuArrow,
} from '../../components/Dropdown.jsx';
import Button from '../../components/Button.jsx';
import IconButton from '../../components/IconButton.jsx';
import { DeleteCommentAlert } from './DeleteCommentAlert.jsx';
import { useSelector, useDispatch } from 'react-redux';
import { selectUserUsername } from '../auth/authSlice.js';
import { DateTime } from 'luxon';
import { editComment } from '../review/reviewSlice.js';
import { indigo } from '@radix-ui/colors';
import { Trash2, Pencil } from 'lucide-react';

const StyledFieldRow = styled(FieldRow, {
  display: 'block',
  paddingBottom: '$3',
  borderRight: 'none',
  '&:last-child': {
    paddingBottom: '0',
  },
});

const StyledAvatar = styled('div', {
  border: 'none',
  borderRadius: '$round',
  height: '$5',
  width: '$5',
  backgroundColor: indigo.indigo4,
  color: indigo.indigo11,
  fontWeight: 'bold',
  display: 'grid',
  placeItems: 'center',
  lineHeight: '$5',
  marginTop: 'auto',
  marginBottom: 'auto',
});

const StyledNameRow = styled('div', {
  display: 'flex',
  gap: '$3',
  marginBottom: '$2',
});

const StyledNameField = styled('div', {
  display: 'flex',
  flexDirection: 'column',
});

const StyledName = styled('div', {
  fontWeight: 'bold',
  lineHeight: '1.2',
  fontSize: '$3',
});

const StyledCommentTime = styled('div', {
  color: '$textLight',
  fontSize: '$2',
});

const StyledComment = styled('div', {
  marginLeft: '49px',
  fontSize: '$3',
});

const StyledDropdownMenuTrigger = styled(DropdownMenuTrigger, {
  marginLeft: 'auto',
});

const StyledDropdownMenuContent = styled(DropdownMenuContent, {
  minWidth: '100px',
  width: '100px',
  right: '20px',
});

const StyledAddCommentRow = styled('div', {
  display: 'flex',
  flexDirection: 'column',
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
  padding: '$3',
  fontSize: '$3',
  fontWeight: '$2',
  boxSizing: 'border-box',
  border: '1px solid',
  borderColor: '$border',
  backgroundColor: '#FFFFFF',
  borderRadius: '$1',
  marginBottom: '$3',
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

const StyledButtonContainer = styled('div', {
  marginLeft: 'auto',
  marginRight: '0',
  display: 'flex',
  gap: '$1',
});

const timeAgoPrettyPrint = (isoDateTimeString) => {
  const then = DateTime.fromISO(isoDateTimeString);
  const now = DateTime.now();
  const diff = now.diff(then, ['years', 'months', 'days', 'hours', 'minutes']);

  const removeDecimals = (dateDiffString) => {
    return dateDiffString.split('.')[0];
  };

  if (diff.years >= 1) {
    return `${removeDecimals(diff.years.toString())} year${Math.floor(diff.years) === 1 ? '' : 's'} ago`;
  }
  if (diff.months >= 1) {
    return `${removeDecimals(diff.months.toString())} month${Math.floor(diff.months) === 1 ? '' : 's'} ago`;
  }
  if (diff.days >= 1) {
    return `${removeDecimals(diff.days.toString())} day${Math.floor(diff.days === 1) ? '' : 's'} ago`;
  }
  if (diff.hours >= 1) {
    return `${removeDecimals(diff.hours.toString())} hour${Math.floor(diff.hours) === 1 ? '' : 's'} ago`;
  }
  if (diff.minutes >= 1) {
    return `${removeDecimals(diff.minutes.toString())} minute${Math.floor(diff.minutes) === 1 ? '' : 's'} ago`;
  }
  return 'a few seconds ago';
};

export const Comment = ({ comment, imageId, onChangeOpen, scrollRef }) => {
  const dispatch = useDispatch();
  const authorInitial = comment.author[0].toUpperCase();
  const currentUser = useSelector(selectUserUsername);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editCommentText, setEditCommentText] = useState(comment.comment);

  const onDeleteConfirm = () => {
    setIsDeleteConfirm(false);
    const deleteCommentDto = {
      id: comment._id,
      imageId: imageId,
    };
    dispatch(editComment('delete', deleteCommentDto));
  };

  const onEditConfirm = () => {
    // If all the comment's content is removed
    // show the delete comment flow
    if (editCommentText === "") {
      setIsDeleteConfirm(true);
      return;
    }
    const editCommentDto = {
      id: comment._id,
      imageId: imageId,
      comment: editCommentText,
    };
    dispatch(editComment('update', editCommentDto));
    setIsEdit(false);
  };

  // Confirm edit comment using enter
  // Shift + Enter makes a new line
  const [isShiftDown, setIsShiftDown] = useState(false);
  const handleKeyDown = (event) => {
    event.stopPropagation();
    if (event.key === 'Shift') {
      setIsShiftDown(true);
    }
    if (event.key === 'Enter' && !isShiftDown) {
      onEditConfirm();
      event.preventDefault();
    }
  };
  const handleKeyUp = (event) => {
    if (event.key === 'Shift') {
      setIsShiftDown(false);
    }
  };

  return (
    <>
      <DeleteCommentAlert
        isOpen={isDeleteConfirm}
        onDeleteConfirm={onDeleteConfirm}
        onDeleteCancel={() => setIsDeleteConfirm(false)}
      />
      <StyledFieldRow ref={scrollRef}>
        <StyledNameRow>
          <StyledAvatar>{authorInitial}</StyledAvatar>
          <StyledNameField>
            <StyledName>{comment.author}</StyledName>
            <StyledCommentTime>{timeAgoPrettyPrint(comment.created)}</StyledCommentTime>
          </StyledNameField>
          {comment.author === currentUser && (
            <DropdownMenu onOpenChange={(isOpen) => onChangeOpen(isOpen)}>
              <StyledDropdownMenuTrigger asChild disabled={isEdit}>
                <IconButton variant="ghost">
                  <DotsHorizontalIcon />
                </IconButton>
              </StyledDropdownMenuTrigger>
              <StyledDropdownMenuContent sideOffset={5}>
                <DropdownMenuItem onSelect={() => setIsDeleteConfirm(true)}>
                  <DropdownMenuItemIconLeft>
                    <Trash2 size={15} />
                  </DropdownMenuItemIconLeft>
                  Delete
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setIsEdit(true)}>
                  <DropdownMenuItemIconLeft>
                    <Pencil size={15} />
                  </DropdownMenuItemIconLeft>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuArrow offset={12} />
              </StyledDropdownMenuContent>
            </DropdownMenu>
          )}
        </StyledNameRow>
        {isEdit ? (
          <StyledAddCommentRow>
            <StyledTextArea
              value={editCommentText}
              onChange={(e) => setEditCommentText(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e)}
              onKeyUp={(e) => handleKeyUp(e)}
            />
            <StyledButtonContainer>
              <Button size="small" onClick={() => setIsEdit(false)}>
                Cancel
              </Button>
              <Button size="small" onClick={() => onEditConfirm()}>
                Update
              </Button>
            </StyledButtonContainer>
          </StyledAddCommentRow>
        ) : (
          <StyledComment>
            {comment.comment.split('\n').map((text, index) => (
              <Fragment key={index}>
                {text}
                <br />
              </Fragment>
            ))}
          </StyledComment>
        )}
      </StyledFieldRow>
    </>
  );
};
