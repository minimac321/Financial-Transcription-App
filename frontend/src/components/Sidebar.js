import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaCalendarAlt, 
  FaCog, 
  FaSignOutAlt,
  FaBars,
  FaChevronLeft
} from 'react-icons/fa';

const SidebarContainer = styled.div`
  background-color: #2c3e50;
  color: white;
  width: ${props => props.isExpanded ? '280px' : '70px'};
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  z-index: 1000;
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${props => props.isExpanded ? 'space-between' : 'center'};
  padding: ${props => props.isExpanded ? '1rem' : '1rem 0'};
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Logo = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 1.2rem;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: ${props => props.isExpanded ? 'block' : 'none'};
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #3498db;
  }
`;

const SidebarContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
`;

const NavSection = styled.div`
  margin-top: 1rem;
  flex: ${props => props.flex || '0'};
  display: flex;
  flex-direction: column;
`;

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: ${props => props.isExpanded ? '0.75rem 1rem' : '0.75rem 0'};
  color: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.7)'};
  text-decoration: none;
  border-left: 3px solid ${props => props.active ? '#3498db' : 'transparent'};
  justify-content: ${props => props.isExpanded ? 'flex-start' : 'center'};
  transition: all 0.2s ease;
  
  &:hover {
    color: white;
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  padding: ${props => props.isExpanded ? '0.75rem 1rem' : '0.75rem 0'};
  color: rgba(255, 255, 255, 0.7);
  background: none;
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
  border-left: 3px solid transparent;
  justify-content: ${props => props.isExpanded ? 'flex-start' : 'center'};
  transition: all 0.2s ease;
  
  &:hover {
    color: white;
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const IconWrapper = styled.div`
  width: ${props => props.isExpanded ? '20px' : '24px'};
  display: flex;
  justify-content: center;
  margin-right: ${props => props.isExpanded ? '10px' : '0'};
`;

const NavText = styled.span`
  white-space: nowrap;
  overflow: hidden;
  opacity: ${props => props.isExpanded ? 1 : 0};
  transition: opacity 0.3s ease;
`;

const Sidebar = ({ user, onLogout }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const location = useLocation();
  
  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };
  
  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    if (path !== '/' && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };
  
  return (
    <SidebarContainer isExpanded={isExpanded}>
      <SidebarHeader isExpanded={isExpanded}>
        <Logo to="/" isExpanded={isExpanded}>Financial Transcription</Logo>
        <ToggleButton onClick={toggleSidebar}>
          {isExpanded ? <FaChevronLeft /> : <FaBars />}
        </ToggleButton>
      </SidebarHeader>
      
      <SidebarContent>
        <NavSection>
          <NavItem to="/" active={isActive('/')} isExpanded={isExpanded}>
            <IconWrapper isExpanded={isExpanded}>
              <FaTachometerAlt />
            </IconWrapper>
            <NavText isExpanded={isExpanded}>Dashboard</NavText>
          </NavItem>
          
          <NavItem to="/clients" active={isActive('/clients')} isExpanded={isExpanded}>
            <IconWrapper isExpanded={isExpanded}>
              <FaUsers />
            </IconWrapper>
            <NavText isExpanded={isExpanded}>Clients</NavText>
          </NavItem>
          
          <NavItem to="/meetings" active={isActive('/meetings')} isExpanded={isExpanded}>
            <IconWrapper isExpanded={isExpanded}>
              <FaCalendarAlt />
            </IconWrapper>
            <NavText isExpanded={isExpanded}>Meetings</NavText>
          </NavItem>
        </NavSection>
        
        <NavSection flex="1">
          {/* Spacer */}
        </NavSection>
        
        <NavSection>
          <NavItem to="/settings" active={isActive('/settings')} isExpanded={isExpanded}>
            <IconWrapper isExpanded={isExpanded}>
              <FaCog />
            </IconWrapper>
            <NavText isExpanded={isExpanded}>Settings</NavText>
          </NavItem>
          
          <NavButton onClick={onLogout} isExpanded={isExpanded}>
            <IconWrapper isExpanded={isExpanded}>
              <FaSignOutAlt />
            </IconWrapper>
            <NavText isExpanded={isExpanded}>Logout</NavText>
          </NavButton>
        </NavSection>
      </SidebarContent>
    </SidebarContainer>
  );
};

export default Sidebar;