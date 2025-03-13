import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { styled, keyframes } from '../theme/stitches.config.js';
import { ExternalLinkIcon, HamburgerMenuIcon, Cross1Icon } from '@radix-ui/react-icons';
import { Link } from 'react-router-dom';
import Button from './Button.jsx';
import IconButton from './IconButton.jsx';

const openOverlayAnimation = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const closeOverlayAnimation = keyframes({
  from: { opacity: 1 },
  to: { opacity: 0 },
});

const animateOverlayOpenClose = {
  '@media (prefers-reduced-motion: no-preference)': {
    '&[data-state="open"]': {
      animation: `${openOverlayAnimation} 0.4s cubic-bezier(0.32,0.72,0,1)`,
    },
    '&[data-state="closed"]': {
      animation: `${closeOverlayAnimation} 0.4s cubic-bezier(0.32,0.72,0,1)`,
    },
  },
};

const openMenuAnimation = keyframes({
  from: { transform: 'translateY(80vh)' },
  to: { transform: 'translateY(0)' },
});

const closeMenuAnimation = keyframes({
  from: { transform: 'translateY(0)' },
  to: { transform: 'translateY(80vh)' },
});

const animateMenuOpenClose = {
  '@media (prefers-reduced-motion: no-preference)': {
    '&[data-state="open"]': { animation: `${openMenuAnimation} 0.4s cubic-bezier(0.32,0.72,0,1)` },
    '&[data-state="closed"]': {
      animation: `${closeMenuAnimation} 0.4s cubic-bezier(0.32,0.72,0,1)`,
    },
  },
};

const openCloseIconStyles = {
  height: '$4',
  width: '$4',
  stroke: '$textDark',
  '&:hover': {
    cursor: 'pointer',
  },
};

const OpenCloseButton = styled(IconButton, {
  borderRadius: '$2',
});

const OpenIcon = styled(HamburgerMenuIcon, {
  ...openCloseIconStyles,
});

const CloseIcon = styled(Cross1Icon, {
  ...openCloseIconStyles,
});

const hiddenLargeScreens = {
  '@bp1': {
    display: 'none',
  },
};

const MenuRoot = styled(Dialog.Root, {
  ...hiddenLargeScreens,
});

const OpenTrigger = styled(Dialog.Trigger, {
  ...hiddenLargeScreens,
});

const Overlay = styled(Dialog.Overlay, {
  zIndex: '$4',
  position: 'fixed',
  height: '100vh',
  width: '100vw',
  top: '0',
  left: '0',
  pointerEvents: 'none',
  backgroundColor: 'rgba(0,0,0,.8)',
  ...animateOverlayOpenClose,
});

const Content = styled(Dialog.Content, {
  zIndex: '$6',
  width: '100vw',
  height: '80vh',
  position: 'fixed',
  left: 0,
  top: '20vh',
  borderRadius: '$3 $3 0 0',
  backgroundColor: '$backgroundLight',
  '&:focus': { outline: 'none' },
  transformOrigin: 'top right',
  ...animateMenuOpenClose,
});

const Body = styled('div', {
  width: '100%',
  height: '80vh',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  padding: '$8 $4 $3 $4',
});

const SignOut = styled(Button, {
  width: '100%',
  marginTop: 'auto',
});

const linkStyles = {
  textDecoration: 'none',
  fontFamily: '$roboto',
  color: '$gray11',
  fontSize: '$5',
  borderBottom: '1px solid transparent',
  '&:hover': {
    color: '$gray12',
    borderBottom: '1px solid $gray7',
  },
};

const A = styled('a', {
  ...linkStyles,
});

const NavLink = styled(Link, {
  ...linkStyles,
});

const LinkWithIcon = styled('span', {
  position: 'relative',
  svg: {
    marginLeft: '$2',
    position: 'absolute',
    top: '50%',
    '-ms-transform': 'translateY(-50%)',
    transform: 'translateY(-50%)',
  },
});

export const HamburgerMenu = ({ signedIn, appActive, signOut }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <MenuRoot onOpenChange={(newState) => setIsOpen(newState)}>
      <OpenTrigger asChild>
        <OpenCloseButton variant="ghost">{isOpen ? <CloseIcon /> : <OpenIcon />}</OpenCloseButton>
      </OpenTrigger>
      <Dialog.Portal>
        <Content>
          <Body>
            {signedIn && appActive && (
              <>
                <Dialog.Close asChild>
                  <A href="https://docs.animl.camera" target="_blank" rel="noreferrer">
                    Documentation
                  </A>
                </Dialog.Close>
                <Dialog.Close asChild>
                  <SignOut onClick={signOut}>Sign out</SignOut>
                </Dialog.Close>
              </>
            )}
            {!appActive && (
              <>
                <Dialog.Close asChild>
                  <NavLink to="/app">Application</NavLink>
                </Dialog.Close>
                <Dialog.Close asChild>
                  <A href="https://docs.animl.camera" target="_blank" rel="noreferrer">
                    Documentation
                  </A>
                </Dialog.Close>
                <Dialog.Close asChild>
                  <A
                    href="https://github.com/tnc-ca-geo/animl-frontend/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <LinkWithIcon>
                      GitHub <ExternalLinkIcon />
                    </LinkWithIcon>
                  </A>
                </Dialog.Close>
              </>
            )}
          </Body>
        </Content>
        <Overlay />
      </Dialog.Portal>
    </MenuRoot>
  );
};
