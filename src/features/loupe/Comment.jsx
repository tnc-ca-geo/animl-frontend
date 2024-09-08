import React, { useState } from 'react';
import { FieldRow } from '../../components/Form.jsx';
import { styled } from '../../theme/stitches.config.js';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuArrow,
} from '../../components/Dropdown.jsx';
import Button from '../../components/Button.jsx';
import IconButton from '../../components/IconButton.jsx';
import { DeleteCommentAlert } from './DeleteCommentAlert.jsx';
import { useSelector, useDispatch } from 'react-redux';
import { selectUserUsername } from '../auth/authSlice.js';
import { DateTime } from 'luxon';
import { editComment } from '../review/reviewSlice.js';

const StyledFieldRow = styled(FieldRow, {
  display: 'block',
  paddingBottom: '$3',
  borderRight: 'none'
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
  lineHeight: '1.2',
  fontSize: '$3'
});

const StyledCommentTime = styled('div', {
  color: '$textLight',
  fontSize: '$2',
});

const StyledComment = styled('div', {
  fontSize: '$3'
});

const StyledDropdownMenuTrigger = styled(DropdownMenuTrigger, {
  marginLeft: 'auto',
});

const StyledDropdownMenuContent = styled(DropdownMenuContent, {
  minWidth: '100px',
  width: '100px',
  right: '20px'
});

const StyledAddCommentRow = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$1',
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
  gap: '$1'
});

const timeAgoPrettyPrint = (isoDateTimeString) => {
  const then = DateTime.fromISO(isoDateTimeString);
  const now = DateTime.now();
  const diff = now.diff(then, ['years', 'months', 'days', 'hours', 'minutes']);

  const removeDecimals = (dateDiffString) => {
    return dateDiffString.split('.')[0];
  }

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
}

export const Comment = ({
  comment,
  imageId
}) => {
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
      imageId: imageId
    };
    dispatch(editComment("delete", deleteCommentDto));
  };

  const onEditConfirm = () => {
    const editCommentDto = {
      id: comment._id,
      imageId: imageId,
      comment: editCommentText
    };
    dispatch(editComment("update", editCommentDto));
    setIsEdit(false);
  };

  return (
    <>
      <DeleteCommentAlert 
        isOpen={isDeleteConfirm}
        onDeleteConfirm={onDeleteConfirm}
        onDeleteCancel={() => setIsDeleteConfirm(false)}
      />
      <StyledFieldRow>
        <StyledNameRow>
          <StyledAvatar>
            { authorInitial }
          </StyledAvatar>
          <StyledNameField>
            <StyledName>{ comment.author }</StyledName>
            <StyledCommentTime>{ timeAgoPrettyPrint(comment.created) }</StyledCommentTime>
          </StyledNameField>
          { comment.author === currentUser &&
            <DropdownMenu>
              <StyledDropdownMenuTrigger asChild disabled={isEdit}>
                <IconButton variant="ghost">
                  <DotsHorizontalIcon />
                </IconButton>
              </StyledDropdownMenuTrigger>
              <StyledDropdownMenuContent sideOffset={5}>
                <DropdownMenuItem onClick={() => setIsDeleteConfirm(true)}>Delete</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsEdit(true)}>Edit</DropdownMenuItem>
                <DropdownMenuArrow offset={12} />
              </StyledDropdownMenuContent>
            </DropdownMenu>
          }
        </StyledNameRow>
        { isEdit ? (
          <StyledAddCommentRow>
            <StyledTextArea 
              value={editCommentText} 
              onChange={(e) => setEditCommentText(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()} 
              onKeyDownCapture={(e) => e.stopPropagation()} 
            />
            <StyledButtonContainer>
              <Button size="small" onClick={() => onEditConfirm()}>Update</Button>
              <Button size="small" onClick={() => setIsEdit(false)}>Discard</Button>
            </StyledButtonContainer>
          </StyledAddCommentRow>
        ) : (
          <StyledComment>
            { comment.comment }
          </StyledComment>
        )}
      </StyledFieldRow>
    </>
  )
}
