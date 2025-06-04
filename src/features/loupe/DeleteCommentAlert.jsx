import React from 'react';
import {
  Alert,
  AlertContent,
  AlertOverlay,
  AlertPortal,
  AlertTitle,
} from '../../components/AlertDialog';
import Button from '../../components/Button.jsx';
import { red } from '@radix-ui/colors';
import { styled } from '../../theme/stitches.config.js';

const StyledButton = styled(Button, {
  width: '100%',
  backgroundColor: red.red4,
  color: red.red11,
  border: 'none',
  '&:hover': { color: red.red11, backgroundColor: red.red5 },
  '@bp2': {
    width: 'unset',
  },
});

const StyledButtonRow = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$2',
  '@bp2': {
    flexDirection: 'row',
    gap: 25,
    justifyContent: 'flex-end',
  },
});

export const DeleteCommentAlert = ({ isOpen, onDeleteConfirm, onDeleteCancel }) => {
  return (
    <Alert open={isOpen}>
      <AlertPortal>
        <AlertOverlay />
        <AlertContent>
          <AlertTitle>Are you sure you&apos;d like to delete this comment?</AlertTitle>
          <p>This action cannot be undone.</p>
          <StyledButtonRow>
            <Button size="small" css={{ border: 'none' }} onClick={() => onDeleteCancel()}>
              Cancel
            </Button>
            <StyledButton size="small" onClick={() => onDeleteConfirm()}>
              Yes, delete
            </StyledButton>
          </StyledButtonRow>
        </AlertContent>
      </AlertPortal>
    </Alert>
  );
};
