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

export const DeleteCommentAlert = ({ isOpen, onDeleteConfirm, onDeleteCancel }) => {
  return (
    <Alert open={isOpen}>
      <AlertPortal>
        <AlertOverlay />
        <AlertContent>
          <AlertTitle>Are you sure you&apos;d like to delete this comment?</AlertTitle>
          <p>This action cannot be undone.</p>
          <div style={{ display: 'flex', gap: 25, justifyContent: 'flex-end' }}>
            <Button size="small" css={{ border: 'none' }} onClick={() => onDeleteCancel()}>
              Cancel
            </Button>
            <Button
              size="small"
              css={{
                backgroundColor: red.red4,
                color: red.red11,
                border: 'none',
                '&:hover': { color: red.red11, backgroundColor: red.red5 },
              }}
              onClick={() => onDeleteConfirm()}
            >
              Yes, delete
            </Button>
          </div>
        </AlertContent>
      </AlertPortal>
    </Alert>
  );
};
