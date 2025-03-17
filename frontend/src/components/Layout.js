import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import styled from 'styled-components';

const LayoutContainer = styled.div`
  display: flex;
`;

const ContentWrapper = styled.div`
  flex: 1;
  margin-left: ${props => props.sidebarWidth};
  width: calc(100% - ${props => props.sidebarWidth});
  transition: margin-left 0.3s ease, width 0.3s ease;
`;

const Main = styled.main`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const UserWelcome = styled.div`
  background-color: #f8f9fa;
  padding: 1rem 2rem;
  border-bottom: 1px solid #e9ecef;
  color: #2c3e50;
  font-weight: 500;
  display: flex;
  justify-content: flex-end;
`;

const Layout = ({ children, user, onLogout }) => {
  const sidebarWidth = "280px"; // Increased from 240px
  
  return (
    <LayoutContainer>
      <Sidebar user={user} onLogout={onLogout} />
      
      <ContentWrapper sidebarWidth={sidebarWidth}>
        <UserWelcome>Welcome, {user?.username || 'User'}</UserWelcome>
        <Main>{children}</Main>
      </ContentWrapper>
    </LayoutContainer>
  );
};

export default Layout;