import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Cross2Icon } from '@radix-ui/react-icons';
import IconButton from './IconButton';
import { Toast, ToastTitle, ToastDescription, ToastAction, ToastViewport } from './Toast';
import {

} from '../features/review/reviewSlice';
import {
  selectProjectSuccessNotifs,
  dismissProjectSuccessNotif,
} from '../features/projects/projectsSlice';
import {

} from '../features/cameras/wirelessCamerasSlice';
import {

} from '../features/images/imagesSlice';
import {

} from '../features/tasks/tasksSlice';
import {

} from '../features/upload/uploadSlice';
import { } from '../features/projects/usersSlice';

const SuccessToast = () => {
  const dispatch = useDispatch();
  const projectSuccessNotifs = useSelector(selectProjectSuccessNotifs);

  const enrichedSuccesses = [
    enrichSuccesses(projectSuccessNotifs, 'projects'),
  ];

  // flattens all arrays into a single array
  const successNotifs = enrichedSuccesses.reduce(
    (acc, curr) => (curr && curr.length ? acc.concat(curr) : acc),
    [],
  );

  const handleDismiss = (successNotif) => {
    dispatch(dismissSuccessMsgs[successNotif.entity](successNotif.index));
  }

  return (
    <>
      {successNotifs &&
        successNotifs.map((successNotif, i) => (
          <Toast key={i} duration={4000} onOpenChange={(() => handleDismiss(successNotif))}>
            <ToastTitle variant="green" css={{ marginBottom: 0 }}>
              {successNotif.title}
            </ToastTitle>
            <ToastDescription asChild>
              <div>{successNotif.msg}</div>
            </ToastDescription>
            <ToastAction asChild altText="Dismiss">
              <IconButton variant="ghost" >
                <Cross2Icon />
              </IconButton>
            </ToastAction>
          </Toast>
      ))}
      <ToastViewport />
    </>
  );
};

const dismissSuccessMsgs = {
  projects: (index) => dismissProjectSuccessNotif(index),
};

function enrichSuccesses(successNotifs, entity) {
  if (!successNotifs || !successNotifs.length) return;
  return successNotifs.map(({ title, message }, index) => ({
    entity: entity,
    title: title,
    msg: message,
    index: index,
  }));
}

export default SuccessToast;
