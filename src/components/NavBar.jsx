import React from 'react';
import { useSelector } from 'react-redux';
import { styled } from '../theme/stitches.config.js';
import { Link } from 'react-router-dom';
import { selectUserUsername, selectUserAuthStatus } from '../features/auth/authSlice.js';
import { selectRouterLocation } from '../features/images/imagesSlice.js';
import ProjectAndViewNav from '../features/projects/ProjectAndViewNav.jsx';
import { useAuthenticator } from '@aws-amplify/ui-react';
import logo from '../assets/animl-logo.svg';
import Button from './Button.jsx';
import { ExternalLinkIcon } from '@radix-ui/react-icons';

const Logo = styled(Link, {
  display: 'flex',
  alignItems: 'center',
  paddingLeft: '$1',
});

const LinkWithIcon = styled('span', {
  position: 'relative',
  'svg': {
    marginLeft: '$2',
    position: 'absolute',
    top: '50%',
    '-ms-transform': 'translateY(-50%)',
    transform: 'translateY(-50%)',
  }
});

const NavLinks = styled('div', {
  paddingRight: '$3',
  'a': {
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
    }
  }
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
      }
    }
  }
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
      <Logo to='/'>
        <img
          alt='Animl'
          src={logo}
          width='126'
        />
      </Logo>
      {(signedIn && appActive) && (
        <>
          <ProjectAndViewNav />
          <NavLinks>
            <a href='https://docs.animl.camera' target="_blank" rel="noreferrer">
              Documentation
            </a>
          </NavLinks>
          <Button
            onClick={signOut}
            size='small'
          >
            Sign out
          </Button>
        </>
      )}
      {!appActive && 
        <NavLinks>
          <Link to='/app'>Application</Link>
          {/*<Link to='/case-studies'>Case studies</Link>*/}
          <a href='https://docs.animl.camera' target="_blank" rel="noreferrer">
            Documentation
          </a>
          <a href='https://github.com/tnc-ca-geo/animl-frontend/' target="_blank" rel="noreferrer">
            <LinkWithIcon>GitHub <ExternalLinkIcon/></LinkWithIcon>
          </a>
        </NavLinks>
      }
    </StyledNav>
  );
};

export default NavBar;