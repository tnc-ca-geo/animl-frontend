import React from 'react';
import * as AD from '@radix-ui/react-alert-dialog';
import {blackA, mauve, red, violet } from '@radix-ui/colors';
import { styled, keyframes } from '@stitches/react';

const AlertDialogOverlay = styled(AD.AlertDialogOverlay, {
  backgroundColor: blackA.blackA9,
  position: 'fixed',
  zIndex: 1000,
  inset: 0,
  animation: 'overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)'
});

const AlertDialogContent = styled(AD.AlertDialogContent, {
  zIndex: 1000,
  backgroundColor: 'white',
  borderRadius: '$2',
  boxShadow: 'hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px',
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90vw',
  maxWidth: '600px',
  maxHeight: '85vh',
  padding: '25px',
  animation: 'contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',

  '&:focus': {
    outline: 'none',
  }
});

const AlertDialogTitle = styled(AD.AlertDialogTitle, {
  margin: 0,
  marginBottom: '$3',
  color: '$textDark', //mauve.mauve12,
  fontSize: '17px',
  fontWeight: '500',
});

const AlertDialogDescription = styled(AD.AlertDialogDescription, {
  marginBottom: '20px',
  color: '$textMedium', // mauve.mauve11,
  fontSize: '15px',
  lineHeight: '1.5',
});

// .Button {
//   display: inline-flex;
//   align-items: center;
//   justify-content: center;
//   border-radius: 4px;
//   padding: 0 15px;
//   font-size: 15px;
//   line-height: 1;
//   font-weight: 500;
//   height: 35px;
// }
// .Button.violet {
//   background-color: white;
//   color: var(--violet-11);
//   box-shadow: 0 2px 10px var(--black-a7);
// }
// .Button.violet:hover {
//   background-color: var(--mauve-3);
// }
// .Button.violet:focus {
//   box-shadow: 0 0 0 2px black;
// }
// .Button.red {
//   background-color: var(--red-4);
//   color: var(--red-11);
// }
// .Button.red:hover {
//   background-color: var(--red-5);
// }
// .Button.red:focus {
//   box-shadow: 0 0 0 2px var(--red-7);
// }
// .Button.mauve {
//   background-color: var(--mauve-4);
//   color: var(--mauve-11);
// }
// .Button.mauve:hover {
//   background-color: var(--mauve-5);
// }
// .Button.mauve:focus {
//   box-shadow: 0 0 0 2px var(--mauve-7);
// }
const overlayShow = keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 },
});

// @keyframes overlayShow {
//   from {
//     opacity: 0;
//   }
//   to {
//     opacity: 1;
//   }
// }

const contentShow = keyframes({
  '0%': { opacity: 0 , transform: 'translate(-50%, -48%) scale(0.96)' },
  '100%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
});

// @keyframes contentShow {
//   from {
//     opacity: 0;
//     transform: translate(-50%, -48%) scale(0.96);
//   }
//   to {
//     opacity: 1;
//     transform: translate(-50%, -50%) scale(1);
//   }
// }

// Exports
export const Alert = AD.Root;
export const AlertPortal = AD.Portal;
export const AlertOverlay = AlertDialogOverlay;
export const AlertTrigger = AD.Trigger;
export const AlertContent = AlertDialogContent;
export const AlertTitle = AlertDialogTitle;
export const AlertDescription = AlertDialogDescription;
export const AlertCancel = AD.Cancel;
export const AlertAction = AD.Action;

export const AlertDialog = () => (
  <AD.Root>
    <AD.Portal>
      <AlertDialogOverlay className="AlertDialogOverlay" />
      <AlertDialogContent className="AlertDialogContent">
        <AlertDialogTitle className="AlertDialogTitle">Are you absolutely sure?</AlertDialogTitle>
        <AlertDialogDescription className="AlertDialogDescription">
          This action cannot be undone. This will permanently delete your account and remove your
          data from our servers.
        </AlertDialogDescription>
        <div style={{ display: 'flex', gap: 25, justifyContent: 'flex-end' }}>
          <AD.Cancel asChild>
            <button className="Button mauve">Cancel</button>
          </AD.Cancel>
          <AD.Action asChild>
            <button className="Button red">Yes, delete account</button>
          </AD.Action>
        </div>
      </AlertDialogContent>
    </AD.Portal>
  </AD.Root>
);
