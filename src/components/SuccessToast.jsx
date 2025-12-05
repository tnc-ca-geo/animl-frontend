import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Cross2Icon } from '@radix-ui/react-icons';
import IconButton from './IconButton';
import { Toast, ToastTitle, ToastDescription, ToastClose, ToastViewport } from './Toast';
import {
  selectProjectSuccessNotif,
  dismissProjectSuccessNotif,
} from '../features/projects/projectsSlice';
import {
  selectCameraSuccessNotif,
  dismissCameraSuccessNotif,
} from '../features/cameras/wirelessCamerasSlice';
import {
  selectTaskSuccessNotif,
  dismissTaskSuccessNotif
} from '../features/tasks/tasksSlice';

const SuccessToast = () => {
  const dispatch = useDispatch();
  const projectSuccessNotifs = useSelector(selectProjectSuccessNotif);
  const cameraSuccessNotifs = useSelector(selectCameraSuccessNotif);
  const taskSuccessNotifs = useSelector(selectTaskSuccessNotif);

  const enrichedSuccesses = [
    enrichSuccesses(projectSuccessNotifs, 'projects'),
    enrichSuccesses(cameraSuccessNotifs, 'cameras'),
    enrichSuccesses(taskSuccessNotifs, 'tasks'),
  ];

  const successNotifs = enrichedSuccesses.filter(notif => notif !== null);

  const handleDismiss = (successNotif) => {
    dispatch(dismissSuccessMsgs[successNotif.entity]());
  }

  return (
    <>
      {successNotifs &&
        successNotifs.map((successNotif, i) => (
          <Toast key={i} duration={successNotif.durationMs} onOpenChange={(() => handleDismiss(successNotif))}>
            <ToastTitle variant="green" css={{ marginBottom: 0 }}>
              {successNotif.title}
            </ToastTitle>
            <ToastDescription asChild>
              <div>{successNotif.msg}</div>
            </ToastDescription>
            <ToastClose asChild>
              <IconButton variant="ghost" >
                <Cross2Icon />
              </IconButton>
            </ToastClose>
          </Toast>
      ))}
      <ToastViewport />
    </>
  );
};

const dismissSuccessMsgs = {
  projects: () => dismissProjectSuccessNotif(),
  cameras: () => dismissCameraSuccessNotif(),
  tasks: () => dismissTaskSuccessNotif(),
};

function enrichSuccesses({title, message, durationMs}, entity) {
  if (title === '' || message === '') return null;
  return {
    entity: entity,
    title: title,
    msg: message,
    durationMs: durationMs || 4000,
  };
}

export default SuccessToast;
