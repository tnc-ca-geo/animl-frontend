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

const StyledFieldRow = styled(FieldRow, {
  display: 'block',
  paddingBottom: '$3'
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
  width: '25px'
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


export const Comment = ({
  isAuthor,
  author,
  time,
  comment
}) => {
  const initial = author[0].toUpperCase();
  const [isEdit, setIsEdit] = useState(false);

  return (
    <StyledFieldRow key={Math.random()}>
      <StyledNameRow>
        <StyledAvatar>
          { initial }
        </StyledAvatar>
        <StyledNameField>
          <StyledName>{ author }</StyledName>
          <StyledCommentTime>{ time }</StyledCommentTime>
        </StyledNameField>
        { isAuthor &&
          <DropdownMenu>
            <StyledDropdownMenuTrigger asChild>
              <IconButton variant="ghost">
                <DotsHorizontalIcon />
              </IconButton>
            </StyledDropdownMenuTrigger>
            <StyledDropdownMenuContent sideOffset={5}>
              <DropdownMenuItem onClick={() => setIsEdit(true)}>Edit</DropdownMenuItem>
              <DropdownMenuItem>Delete</DropdownMenuItem>
              <DropdownMenuArrow offset={12} />
            </StyledDropdownMenuContent>
          </DropdownMenu>
        }
      </StyledNameRow>
      { isEdit ? (
        <StyledAddCommentRow>
          <StyledTextArea value={comment} />
          <StyledButtonContainer>
            <Button size="small">Update</Button>
            <Button size="small" onClick={() => setIsEdit(false)}>Discard</Button>
          </StyledButtonContainer>
        </StyledAddCommentRow>
      ) : (
        <StyledComment>
          { comment }
        </StyledComment>
      )}
    </StyledFieldRow>
  )
}
