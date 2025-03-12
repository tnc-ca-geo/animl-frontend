import React from 'react';
import { useSelector } from 'react-redux';
import { styled } from '../theme/stitches.config.js';
import { Link } from 'react-router-dom';
import { selectUserUsername, selectUserAuthStatus } from '../features/auth/authSlice.js';
import { selectRouterLocation } from '../features/images/imagesSlice.js';
import ProjectAndViewNav from '../features/projects/ProjectAndViewNav.jsx';
import { useAuthenticator } from '@aws-amplify/ui-react';
import logo from '../assets/animl-logo.svg';
import logoFox from '../assets/animl-logo-fox.svg';
import Button from './Button.jsx';
import { ExternalLinkIcon } from '@radix-ui/react-icons';
import { HamburgerMenu } from './HamburgerMenu.jsx';

const Logo = styled(Link, {
  display: 'flex',
  alignItems: 'center',
  paddingLeft: '$1',
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

const NavLinks = styled('div', {
  paddingRight: '$3',
  a: {
    marginLeft: '$3',
    marginRight: '$3',
    paddingBottom: '$1',
    textDecoration: 'none',
    fontFamily: '$roboto',
    color: '$gray11',
    borderWidth: 'thin',
    '&:hover': {
      color: '$gray12',
      borderBottom: '1px solid $gray7',
    },
  },
  '@media only screen and (max-width: 600px)': {
    display: 'none',
  },
});

const ResponsiveSignOut = styled(Button, {
  '@media only screen and (max-width: 600px)': {
    display: 'none',
  },
});

const StyledNav = styled('nav', {
  boxSizing: 'border-box',
  width: '100%',
  height: '$8',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '$0 $3',
  backgroundColor: 'none',

  variants: {
    appActive: {
      true: {
        backgroundColor: '$backgroundLight',
      },
    },
  },
});

const NavBar = () => {
  const { signOut } = useAuthenticator((context) => [context.user]);
  const authStatus = useSelector(selectUserAuthStatus);
  const user = useSelector(selectUserUsername);
  const signedIn = authStatus === 'authenticated' && user;
  const routerLocation = useSelector(selectRouterLocation);
  const paths = routerLocation.pathname.split('/').filter((p) => p.length > 0);
  const appActive = paths[0] === 'app';

  return (
    <StyledNav appActive={appActive}>
      <Logo to="/">
        <picture>
          <source
            srcSet={logoFox}
            media={`(max-width: ${appActive ? '799' : '600'}px)`}
            width="30"
          />
          <img alt="Animl" src={logo} width="126" />
        </picture>
      </Logo>
      {signedIn && appActive && (
        <>
          <ProjectAndViewNav />
          <NavLinks>
            <a href="https://docs.animl.camera" target="_blank" rel="noreferrer">
              Documentation
            </a>
          </NavLinks>
          <ResponsiveSignOut onClick={signOut} size="small">
            Sign out
          </ResponsiveSignOut>
        </>
      )}
      {!appActive && (
        <NavLinks>
          <Link to="/app">Application</Link>
          {/*<Link to='/case-studies'>Case studies</Link>*/}
          <a href="https://docs.animl.camera" target="_blank" rel="noreferrer">
            Documentation
          </a>
          <a href="https://github.com/tnc-ca-geo/animl-frontend/" target="_blank" rel="noreferrer">
            <LinkWithIcon>
              GitHub <ExternalLinkIcon />
            </LinkWithIcon>
          </a>
        </NavLinks>
      )}
      <HamburgerMenu appActive={appActive} signedIn={signedIn} signOut={signOut} />
    </StyledNav>
  );
};

export default NavBar;
