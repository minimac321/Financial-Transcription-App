import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { FaFileAlt } from 'react-icons/fa';
import config from '../config';


const LoginContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f5f5f5;
`;

const LoginFormContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const LoginForm = styled.form`
  background-color: white;
  padding: 2.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
`;

const PromotionalContent = styled.div`
  flex: 1;
  background-color: #f0f4ff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 3rem;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const PromoContainer = styled.div`
  background-color: #e8ecfe;
  padding: 2.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 550px;
  margin: 0 auto;
`;

const Title = styled.h1`
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
`;

const PromoTitle = styled.h1`
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 2.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  span {
    color: #5b5fc7;
  }
  
  svg {
    color: #5b5fc7;
  }
`;

const PromoSubtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 3rem;
  line-height: 1.6;
`;

const FeatureSection = styled.div`
  margin-top: 2rem;
`;

const Feature = styled.div`
  margin-bottom: 2rem;
`;

const FeatureTitle = styled.h3`
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const FeatureDescription = styled.p`
  color: #666;
  line-height: 1.5;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  
  &:hover {
    background-color: #1a252f;
  }
  
  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  margin-top: 1rem;
  text-align: center;
`;

const LoginPage = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      console.log("🔍 Attempting login...");
      console.log("📡 Request URL:", `${config.apiUrl}/api/auth/login`);
      console.log("📨 Request Body:", credentials);

      const response = await axios.post(`${config.apiUrl}/api/auth/login`, credentials, {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      console.log("✅ Login response:", response);
      console.log("📄 Headers received:", response.headers);
      console.log("🍪 Set-Cookie Header:", response.headers['set-cookie']);

      if (response.data.user) {
        console.log("✅ User authenticated:", response.data.user);
        onLogin(response.data.user);
        navigate('/');
      } else {
        console.warn("⚠️ Login failed: No user data returned.");
        setError('Login failed: No user data returned');
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      setError(
        error.response?.data?.message || 
        'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginFormContainer>
        <LoginForm onSubmit={handleSubmit}>
          <Title>Financial Transcription</Title>
          
          {/* <div style={{
            backgroundColor: '#e8f4fc',
            border: '1px solid #bde0fd',
            borderRadius: '4px',
            padding: '12px',
            marginBottom: '20px',
            fontSize: '14px',
            color: '#0c5991'
          }}>
            Log in with username: <strong>admin</strong> and password: <strong>password</strong>
          </div> */}
          
          <FormGroup>
            <Label htmlFor="username">Username</Label>
            <Input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </FormGroup>
          
          <Button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </LoginForm>
      </LoginFormContainer>

      <PromotionalContent>
        <PromoContainer>
          <PromoTitle>
            <FaFileAlt size={28} /> Transcribe <span>with AI</span>
          </PromoTitle>
          <PromoSubtitle>
            Transform your financial meetings into actionable insights with AI-powered transcription and analysis.
          </PromoSubtitle>

          <FeatureSection>
            <Feature>
              <FeatureTitle>Automated Transcription</FeatureTitle>
              <FeatureDescription>
                Upload audio/video files and get accurate transcripts instantly
              </FeatureDescription>
            </Feature>

            <Feature>
              <FeatureTitle>AI Summaries</FeatureTitle>
              <FeatureDescription>
                Get intelligent summaries highlighting key financial points
              </FeatureDescription>
            </Feature>

            <Feature>
              <FeatureTitle>Client Management</FeatureTitle>
              <FeatureDescription>
                Organize transcripts by client and track meetings efficiently
              </FeatureDescription>
            </Feature>
          </FeatureSection>
        </PromoContainer>
      </PromotionalContent>
    </LoginContainer>
  );
};

export default LoginPage;
