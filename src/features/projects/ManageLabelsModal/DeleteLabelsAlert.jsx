import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { deleteProjectLabel } from '../projectsSlice.js';
import LabelPill from '../../../components/LabelPill';
import {
  Alert,
  AlertPortal,
  AlertOverlay,
  AlertContent,
  AlertTitle,
} from '../../../components/AlertDialog.jsx';
import Button from '../../../components/Button.jsx';
import { red } from '@radix-ui/colors';
import Callout from '../../../components/Callout.jsx';
import PermanentActionConfirmation from '../../../components/PermanentActionConfirmation.jsx';

const DeleteLabelsAlert = ({ open, setAlertOpen, label }) => {
  const dispatch = useDispatch();

  const [confirmedDelete, setConfirmedDelete] = useState(false);

  const handleDelete = () => {
    dispatch(deleteProjectLabel({ _id: label._id }));
    setAlertOpen(false);
  };

  const handleCancelDelete = () => {
    setAlertOpen(false);
  };

  return (
    <Alert open={open}>
      <AlertPortal>
        <AlertOverlay />
        <AlertContent>
          <AlertTitle>
            Are you sure you&apos;d like to delete the{' '}
            {label && (
              <LabelPill css={{ display: 'inline' }} color={label.color} name={label.name} />
            )}{' '}
            label?
          </AlertTitle>
          <Callout type="warning">
            <div>
              <p>Deleting this Label will:</p>
              <ul>
                <li>
                  remove it as an option to apply to your images (
                  <i>
                    Note: if this is your only goal, this can also be accomplished by
                    &quot;disabling&quot;, rather than deleting, the label.
                  </i>
                  )
                </li>
                <li>remove all instances of it from your existing images</li>
                <li>
                  if the label has been validated as the correct, accurate label on objects,
                  deleting it will remove the label and unlock those objects, which will revert all
                  affected images to a &quot;not-reviewed&quot; state
                </li>
              </ul>
              <p>
                <strong>This action can not be undone.</strong>
              </p>
            </div>
          </Callout>
          <PermanentActionConfirmation
            text="permanently delete"
            setConfirmed={setConfirmedDelete}
          />
          <div style={{ display: 'flex', gap: 25, justifyContent: 'flex-end' }}>
            <Button size="small" css={{ border: 'none' }} onClick={handleCancelDelete}>
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
              disabled={!confirmedDelete}
              onClick={handleDelete}
            >
              Yes, delete
            </Button>
          </div>
        </AlertContent>
      </AlertPortal>
    </Alert>
  );
};

export default DeleteLabelsAlert;
