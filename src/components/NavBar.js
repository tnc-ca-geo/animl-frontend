import React from 'react';
import { styled } from '../theme/stitches.config.js';
import { Link, NavLink } from 'react-router-dom';
import logo from '../assets/animl-logo.svg'

const Logo = styled(Link, {
  display: 'flex',
  alignItems: 'center',
});

const NavLinks = styled.div({
  display: 'flex',
});

const StyledNav = styled.nav({
  boxSizing: 'border-box',
  width: '100%',
  height: '$7',
  display: 'flex',
  alignItems: 'center',
  padding: '$0 $4',
});

const NavContainer = styled.div({
  boxSizing: 'border-box',
  width: '100%',
  height: '$7',
  borderBottom: '$1 solid $gray400',
  backgroundColor: '$lowContrast',
})

const NavBar = () => {
  return (
    <NavContainer>
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
    </NavContainer>
  );
};

export default NavBar;