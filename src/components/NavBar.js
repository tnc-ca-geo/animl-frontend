import React from 'react';
import { styled } from '../theme/stitches.config.js';
import { Link } from 'react-router-dom';
import ProjectAndViewNav from '../features/projects/ProjectAndViewNav';
import { Auth, Hub } from 'aws-amplify';
import logo from '../assets/animl-logo.svg';
import Button from './Button';

const Logo = styled(Link, {
  display: 'flex',
  alignItems: 'center',
  paddingLeft: '$1',
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
      <ProjectAndViewNav />
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