import React from 'react';
import { styled } from '../theme/stitches.config.js';
import { Link, NavLink } from 'react-router-dom';
import ViewSelector from '../features/views/ViewSelector';
import { Auth, Hub } from 'aws-amplify';
import logo from '../assets/animl-logo.svg';
import Button from './Button';

// const StyledSignOut = styled(AmplifySignOut, {
//   backgroundColor: '$hiContrast',
// })

const Logo = styled(Link, {
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  paddingLeft: '$1',
});

const NavLinks = styled('div', {
  display: 'flex',
});

const ViewSelectorWrapper = styled('div', {
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
});

const StyledNav = styled('nav', {
  boxSizing: 'border-box',
  width: '100%',
  height: '$8',
  display: 'flex',
  alignItems: 'center',
  padding: '$0 $3',
  borderBottom: '1px solid $gray400',
  backgroundColor: '$loContrast',
});


const NavBar = () => {

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
      {/*<NavLinks>
        <li>
          <NavLink to="/">Home</NavLink>
        </li>
        <li>
          <NavLink to="/counter">Counter</NavLink>
        </li>
      </NavLinks>*/}
      <ViewSelectorWrapper>
        <ViewSelector />
      </ViewSelectorWrapper>
      <Button
        onClick={handleSignOutButtonClick}
        size='small'
      >
        Sign out
      </Button>
    </StyledNav>
  );
};

export default NavBar;