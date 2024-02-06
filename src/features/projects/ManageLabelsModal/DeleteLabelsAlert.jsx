import React from 'react';
import { useDispatch } from 'react-redux';
import { deleteProjectLabel } from '../projectsSlice.js';
import LabelPill from "../../../components/LabelPill";
import { Alert, AlertPortal, AlertOverlay, AlertContent, AlertTitle } from '../../../components/AlertDialog.jsx';
import Button from '../../../components/Button.jsx';
import { red, mauve } from '@radix-ui/colors';


const DeleteLabelsAlert = ({ open, setAlertOpen, label}) => {
  const dispatch = useDispatch();

  const handleConfirmDelete = () => {
    dispatch(deleteProjectLabel({ _id: label._id }));
    setAlertOpen(false);
  };

  const handleCancelDelete = (e) => {
    setAlertOpen(false);
  };

  return (
    <Alert
      open={open}
    >
      <AlertPortal>
        <AlertOverlay/>
        <AlertContent>
          <AlertTitle>
            Are you sure you'd like to delete the {label && <LabelPill css={{ display: 'inline' }} color={label.color} name={label.name} />} label?
          </AlertTitle>
          <div>Deleting this label will:
            <ul>
              <li>remove it as an option to apply to your images (<i>if this is your only goal, this can also be accomplished by "disabling", rather than deleting, the label</i>)</li>
              <li>remove all instances of it from your existing images</li>
              <li>unlock all objects that included the label, which will revert all affected images to a "not-reviewed" state</li>
            </ul>
          This action can not be undone.</div>
          <div style={{ display: 'flex', gap: 25, justifyContent: 'flex-end' }}>
            <Button size='small' css={{ border: 'none' }} onClick={handleCancelDelete}>Cancel</Button>
            <Button
              size='small'
              css={{
                backgroundColor: red.red4,
                color: red.red11,
                border: 'none',
                '&:hover': { color: red.red11, backgroundColor: red.red5 }
              }}
              onClick={handleConfirmDelete}
            >
              Yes, delete
            </Button>
          </div>
        </AlertContent>
      </AlertPortal>
    </Alert>
  )
};

export default DeleteLabelsAlert;