import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaHome, FaExclamationTriangle } from 'react-icons/fa';

const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f8f9fa;
  padding: 1rem;
  text-align: center;
`;

const Icon = styled.div`
  color: #e74c3c;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 2.5rem;
`;

const Message = styled.p`
  color: #7f8c8d;
  margin-bottom: 2rem;
  font-size: 1.1rem;
  max-width: 500px;
`;

const HomeLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #2c3e50;
  color: white;
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  
  &:hover {
    background-color: #1a252f;
  }
`;

const NotFound = () => {
  return (
    <NotFoundContainer>
      <Icon>
        <FaExclamationTriangle size={64} />
      </Icon>
      <Title>404 - Page Not Found</Title>
      <Message>
        The page you're looking for doesn't exist or has been moved.
      </Message>
      <HomeLink to="/">
        <FaHome size={16} />
        Return to Home
      </HomeLink>
    </NotFoundContainer>
  );
};

export default NotFound;