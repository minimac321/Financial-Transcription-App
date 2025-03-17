import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background-color: #2c3e50;
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: bold;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  margin-left: 1.5rem;
  padding: 0.5rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const LogoutButton = styled.button`
  background-color: transparent;
  color: white;
  border: 1px solid white;
  padding: 0.5rem 1rem;
  margin-left: 1.5rem;
  cursor: pointer;
  border-radius: 4px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const UserInfo = styled.span`
  margin-left: 1.5rem;
  color: #ecf0f1;
`;

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };
  
  return (
    <HeaderContainer>
      <Logo to="/">Financial Transcription</Logo>
      <Nav>
        <NavLink to="/">Dashboard</NavLink>
        {user && <UserInfo>Welcome, {user.username}</UserInfo>}
        <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
      </Nav>
    </HeaderContainer>
  );
};

export default Header;