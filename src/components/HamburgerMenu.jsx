import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { styled, keyframes } from '../theme/stitches.config.js';
import { ExternalLinkIcon, HamburgerMenuIcon, Cross1Icon } from '@radix-ui/react-icons';
import { Link } from 'react-router-dom';
import logo from '../assets/animl-logo-fox.svg';
import Button from './Button.jsx';
import IconButton from './IconButton.jsx';

const openMenuAnimation = keyframes({
  from: { transform: 'translateX(30vw)', opacity: 0 },
  to: { transform: 'translateX(0)', opacity: 1 },
});

const closeMenuAnimation = keyframes({
  from: { transform: 'translateX(0)', opacity: 1 },
  to: { transform: 'translateX(30vw)', opacity: 0 },
});

const animateOpenClose = {
  '@media (prefers-reduced-motion: no-preference)': {
    '&[data-state="open"]': { animation: `${openMenuAnimation} 200ms ease` },
    '&[data-state="closed"]': { animation: `${closeMenuAnimation} 200ms ease` },
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
  height: '20px',
  width: '20px',
});

const Logo = styled(Link, {
  display: 'flex',
  alignItems: 'center',
  paddingLeft: '$1',
});

const hiddenLargeScreens = {
  '@media only screen and (min-width: 600px)': {
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
  ...animateOpenClose,
});

const Content = styled(Dialog.Content, {
  zIndex: '$6',
  width: '100vw',
  height: '100vh',
  position: 'fixed',
  left: 0,
  top: 0,
  backgroundColor: '$backgroundLight',
  '&:focus': { outline: 'none' },
  transformOrigin: 'top right',
  ...animateOpenClose,
});

const Title = styled('nav', {
  width: '100%',
  height: '$8',
  boxSizing: 'border-box',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '$0 12px',
  display: 'flex',
});

const Body = styled('div', {
  width: '100%',
  height: 'calc(100vh - $8)',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  padding: '$8 12px',
});

const SignOut = styled(Button, {
  width: '100%',
  marginTop: 'auto',
});

const linkStyles = {
  textDecoration: 'none',
  fontFamily: '$roboto',
  color: '$gray11',
  textAlign: 'center',
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
  return (
    <MenuRoot>
      <OpenTrigger asChild>
        <OpenCloseButton variant="ghost">
          <OpenIcon />
        </OpenCloseButton>
      </OpenTrigger>
      <Dialog.Portal>
        <Content>
          <Overlay>
            <Title>
              <Dialog.Close asChild>
                <Logo to="/">
                  <picture>
                    <img alt="Animl" src={logo} width="30" />
                  </picture>
                </Logo>
              </Dialog.Close>
              <Dialog.Close asChild>
                <OpenCloseButton variant="ghost">
                  <CloseIcon />
                </OpenCloseButton>
              </Dialog.Close>
            </Title>
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
          </Overlay>
        </Content>
      </Dialog.Portal>
    </MenuRoot>
  );
};
