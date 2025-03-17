import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import Layout from '../components/Layout';
import { FaSave, FaUser, FaKey, FaAt, FaCog } from 'react-icons/fa';

const PageHeader = styled.div`
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  color: #2c3e50;
  font-size: 1.75rem;
  margin: 0 0 0.5rem 0;
`;

const PageDescription = styled.p`
  color: #7f8c8d;
  margin: 0;
`;

const SettingsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 2fr;
  }
`;

const SettingsNav = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const NavItem = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 1rem 1.5rem;
  background-color: ${props => props.active ? '#f8f9fa' : 'transparent'};
  border: none;
  border-left: 3px solid ${props => props.active ? '#3498db' : 'transparent'};
  text-align: left;
  font-size: 1rem;
  color: ${props => props.active ? '#2c3e50' : '#7f8c8d'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f8f9fa;
    color: #2c3e50;
  }
`;

const IconWrapper = styled.div`
  margin-right: 0.75rem;
`;

const SettingsContent = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
`;

const SectionTitle = styled.h2`
  color: #2c3e50;
  font-size: 1.25rem;
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #ecf0f1;
`;

const Form = styled.form``;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    border-color: #3498db;
    outline: none;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    border-color: #3498db;
    outline: none;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  
  &:hover {
    background-color: #1a252f;
  }
  
  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled.div`
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #e6f7ed;
  color: #27ae60;
  border-radius: 4px;
`;

const ErrorMessage = styled.div`
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #fdeaec;
  color: #e74c3c;
  border-radius: 4px;
`;

const SettingsSection = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #ecf0f1;
  
  &:first-child {
    margin-top: 0;
    padding-top: 0;
    border-top: none;
  }
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
`;

const ToggleLabel = styled.div`
  margin-left: 0.75rem;
  color: ${props => props.enabled ? '#2c3e50' : '#7f8c8d'};
  font-size: 0.875rem;
`;

const SettingsPage = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    username: user?.username || '',
    email: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [apiSettings, setApiSettings] = useState({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
    model: 'gpt-4'
  });
  const [appSettings, setAppSettings] = useState({
    darkMode: false,
    notifications: true,
    autoRefresh: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleApiSettingsChange = (e) => {
    const { name, value } = e.target;
    setApiSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAppSettingsChange = (e) => {
    const { name, checked } = e.target;
    setAppSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    // Simulate API call
    setTimeout(() => {
      setSuccessMessage('Profile updated successfully');
      setSubmitting(false);
    }, 1000);
  };
  
  const handleChangePassword = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage('New passwords do not match');
      setSubmitting(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      setSuccessMessage('Password changed successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setSubmitting(false);
    }, 1000);
  };
  
  const handleSaveApiSettings = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    // Simulate API call
    setTimeout(() => {
      setSuccessMessage('API settings saved successfully');
      setSubmitting(false);
    }, 1000);
  };
  
  const handleSaveAppSettings = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    // Simulate API call
    setTimeout(() => {
      setSuccessMessage('Application settings saved successfully');
      setSubmitting(false);
    }, 1000);
  };
  
  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <>
            <SectionTitle>Profile Settings</SectionTitle>
            <Form onSubmit={handleSaveProfile}>
              <FormGroup>
                <Label htmlFor="username">Username</Label>
                <Input
                  type="text"
                  id="username"
                  name="username"
                  value={profileForm.username}
                  onChange={handleProfileChange}
                  disabled
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  placeholder="Enter your email"
                />
              </FormGroup>
              
              <SaveButton type="submit" disabled={submitting}>
                <FaSave size={14} />
                {submitting ? 'Saving...' : 'Save Profile'}
              </SaveButton>
              
              {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
              {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
            </Form>
          </>
        );
        
      case 'password':
        return (
          <>
            <SectionTitle>Change Password</SectionTitle>
            <Form onSubmit={handleChangePassword}>
              <FormGroup>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </FormGroup>
              
              <SaveButton type="submit" disabled={submitting}>
                <FaSave size={14} />
                {submitting ? 'Changing...' : 'Change Password'}
              </SaveButton>
              
              {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
              {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
            </Form>
          </>
        );
        
      case 'api':
        return (
          <>
            <SectionTitle>API Settings</SectionTitle>
            <Form onSubmit={handleSaveApiSettings}>
              <FormGroup>
                <Label htmlFor="apiKey">OpenAI API Key</Label>
                <Input
                  type="text"
                  id="apiKey"
                  name="apiKey"
                  value={apiSettings.apiKey}
                  onChange={handleApiSettingsChange}
                  placeholder="Enter your OpenAI API key"
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="model">OpenAI Model</Label>
                <Select
                  id="model"
                  name="model"
                  value={apiSettings.model}
                  onChange={handleApiSettingsChange}
                >
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="whisper-1">Whisper-1 (Audio)</option>
                </Select>
              </FormGroup>
              
              <SaveButton type="submit" disabled={submitting}>
                <FaSave size={14} />
                {submitting ? 'Saving...' : 'Save API Settings'}
              </SaveButton>
              
              {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
              {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
            </Form>
          </>
        );
        
      case 'app':
        return (
          <>
            <SectionTitle>Application Settings</SectionTitle>
            <Form onSubmit={handleSaveAppSettings}>
              <SettingsSection>
                <Label>Interface</Label>
                <FormGroup>
                  <ToggleContainer>
                    <input
                      type="checkbox"
                      id="darkMode"
                      name="darkMode"
                      checked={appSettings.darkMode}
                      onChange={handleAppSettingsChange}
                    />
                    <ToggleLabel isEnabled={appSettings.darkMode}>Dark Mode</ToggleLabel>
                  </ToggleContainer>
                </FormGroup>
              </SettingsSection>
              
              <SettingsSection>
                <Label>Notifications</Label>
                <FormGroup>
                  <ToggleContainer>
                    <input
                      type="checkbox"
                      id="notifications"
                      name="notifications"
                      checked={appSettings.notifications}
                      onChange={handleAppSettingsChange}
                    />
                    <ToggleLabel isEnabled={appSettings.notifications}>Enable Notifications</ToggleLabel>
                  </ToggleContainer>
                </FormGroup>
              </SettingsSection>
              
              <SettingsSection>
                <Label>Performance</Label>
                <FormGroup>
                  <ToggleContainer>
                    <input
                      type="checkbox"
                      id="autoRefresh"
                      name="autoRefresh"
                      checked={appSettings.autoRefresh}
                      onChange={handleAppSettingsChange}
                    />
                    <ToggleLabel isEnabled={appSettings.autoRefresh}>Auto-refresh Meeting Status</ToggleLabel>
                  </ToggleContainer>
                </FormGroup>
              </SettingsSection>
              
              <SaveButton type="submit" disabled={submitting}>
                <FaSave size={14} />
                {submitting ? 'Saving...' : 'Save Application Settings'}
              </SaveButton>
              
              {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
              {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
            </Form>
          </>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Layout user={user} onLogout={onLogout}>
      <PageHeader>
        <PageTitle>Settings</PageTitle>
        <PageDescription>Manage your account and application preferences</PageDescription>
      </PageHeader>
      
      <SettingsContainer>
        <SettingsNav>
          <NavItem 
            active={activeSection === 'profile'} 
            onClick={() => setActiveSection('profile')}
          >
            <IconWrapper>
              <FaUser size={16} />
            </IconWrapper>
            Profile
          </NavItem>
          
          <NavItem 
            active={activeSection === 'password'} 
            onClick={() => setActiveSection('password')}
          >
            <IconWrapper>
              <FaKey size={16} />
            </IconWrapper>
            Password
          </NavItem>
          
          <NavItem 
            active={activeSection === 'api'} 
            onClick={() => setActiveSection('api')}
          >
            <IconWrapper>
              <FaAt size={16} />
            </IconWrapper>
            API Settings
          </NavItem>
          
          <NavItem 
            active={activeSection === 'app'} 
            onClick={() => setActiveSection('app')}
          >
            <IconWrapper>
              <FaCog size={16} />
            </IconWrapper>
            App Settings
          </NavItem>
        </SettingsNav>
        
        <SettingsContent>
          {renderContent()}
        </SettingsContent>
      </SettingsContainer>
    </Layout>
  );
};

export default SettingsPage;