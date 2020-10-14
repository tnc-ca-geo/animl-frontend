import React from 'react';
import styled from 'styled-components';
import { Link, NavLink } from 'react-router-dom';
import logo from '../assets/animl-logo.svg'

const StyledNav = styled.nav`
  width: 100%;
  height: 55px;
  display: flex;
  align-items: center;
  padding: 0px 25px;
  background-color: #FFFFFF;
  border-bottom: ${props => props.theme.border};
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
`

const NavLinks = styled.div`
  display: flex;
`;

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