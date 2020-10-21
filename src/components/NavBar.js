import React from 'react';
import { styled } from '../theme/stitches.config.js';
import { Link, NavLink } from 'react-router-dom';
import logo from '../assets/animl-logo.svg'

const StyledNav = styled.nav({
  width: '100%',
  height: '$7',
  display: 'flex',
  alignItems: 'center',
  padding: '$0 $4',
  backgroundColor: '$lowContrast',
  borderBottom: '$1 solid $gray400',
});

const Logo = styled(Link, {
  display: 'flex',
  alignItems: 'center',
});

const NavLinks = styled.div({
  display: 'flex',
});

const NavBar = () => {
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
    </StyledNav>
  );
};

export default NavBar;