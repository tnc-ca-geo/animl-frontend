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

export const BulkUpdateConfidenceConfigAlert = ({ isOpen, onUpdateConfirm, onUpdateCancel }) => {
  return (
    <Alert open={isOpen}>
      <AlertPortal>
        <AlertOverlay />
        <AlertContent>
          <AlertTitle>Update all currently filtered labels?</AlertTitle>
          <p>
            This will override the existing confidence threshold settings for all currently filtered
            labels.
          </p>
          <div style={{ display: 'flex', gap: 25, justifyContent: 'flex-end' }}>
            <Button size="small" css={{ border: 'none' }} onClick={() => onUpdateCancel()}>
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
              onClick={() => onUpdateConfirm()}
            >
              Yes, update all
            </Button>
          </div>
        </AlertContent>
      </AlertPortal>
    </Alert>
  );
};
