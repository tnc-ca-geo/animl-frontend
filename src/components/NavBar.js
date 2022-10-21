import React from 'react';
import { useSelector } from 'react-redux';
import { styled } from '../theme/stitches.config.js';
import { Link } from 'react-router-dom';
import { selectUserUsername, selectUserAuthState } from '../features/user/userSlice.js';
import { selectRouterLocation } from '../features/images/imagesSlice';
import ProjectAndViewNav from '../features/projects/ProjectAndViewNav';
import { AuthState } from '@aws-amplify/ui-components';
import { Auth, Hub } from 'aws-amplify';
import logo from '../assets/animl-logo.svg';
import Button from './Button';

const Logo = styled(Link, {
  display: 'flex',
  alignItems: 'center',
  paddingLeft: '$1',
});

const NavLinks = styled('div', {
  'a': {
    paddingLeft: '$3',
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
  borderBottom: '1px solid $gray400',
  backgroundColor: '$loContrast',
});


const NavBar = () => {
  const authState = useSelector(selectUserAuthState);
  const user = useSelector(selectUserUsername);
  const signedIn = authState === AuthState.SignedIn && user;
  const routerLocation = useSelector(selectRouterLocation);
  const paths = routerLocation.pathname.split('/').filter((p) => p.length > 0);
  const appActive = paths[0] === 'app';

  console.log('router location: ', routerLocation);

  const handleSignOutButtonClick = async () => {
    try {
      await Auth.signOut();
      Hub.dispatch('UI Auth', { 
        event: 'AuthStateChange',
        message: 'signedout'
      });
    } catch (error) {
      console.log('error signing out: ', error);
    }
  };

  return (
    <StyledNav>
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
          <Button
            onClick={handleSignOutButtonClick}
            size='small'
          >
            Sign out
          </Button>
        </>
      )}
      {!appActive && 
        <NavLinks>
          <Link to='/app'>Application</Link>
          <a href='https://github.com/tnc-ca-geo/animl-frontend/' target="_blank" rel="noreferrer">
            Github
          </a>
        </NavLinks>
      }
    </StyledNav>
  );
};

export default NavBar;