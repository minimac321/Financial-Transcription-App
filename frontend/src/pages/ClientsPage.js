import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import Layout from '../components/Layout';
import { FaPlus, FaSpinner, FaEdit, FaTrash, FaArrowLeft, FaArrowRight, FaCheck } from 'react-icons/fa';
import config from '../config';

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  color: #2c3e50;
  font-size: 1.75rem;
  margin: 0;
`;

const AddButton = styled.button`
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
`;

const ClientsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const ClientCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const ClientHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #ecf0f1;
`;

const ClientName = styled(Link)`
  color: #2c3e50;
  font-size: 1.25rem;
  font-weight: 600;
  text-decoration: none;
  
  &:hover {
    color: #3498db;
  }
`;

const CompanyName = styled.div`
  color: #7f8c8d;
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

const ClientDetails = styled.div`
  padding: 1rem 1.5rem;
`;

const ClientDetail = styled.div`
  margin-bottom: 0.75rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.span`
  color: #7f8c8d;
  font-size: 0.75rem;
  display: block;
  margin-bottom: 0.25rem;
`;

const DetailValue = styled.span`
  color: #2c3e50;
  font-size: 0.875rem;
`;

const ClientActions = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 1rem 1.5rem;
  border-top: 1px solid #ecf0f1;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  color: #7f8c8d;
  
  &:hover {
    background-color: #f8f9fa;
    color: #2c3e50;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const EmptyStateText = styled.p`
  color: #7f8c8d;
  margin-bottom: 1.5rem;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  padding: 2rem;
  color: #7f8c8d;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  padding: 2rem;
  overflow-y: auto;
`;

const ModalTitle = styled.h2`
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 1.5rem;
`;

const ModalForm = styled.form``;

const ModalFormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const ModalLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
`;

const ModalInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const ModalSelect = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    border-color: #3498db;
    outline: none;
  }
`;

const ModalButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
`;

const CancelButton = styled.button`
  padding: 0.75rem 1rem;
  background-color: #ecf0f1;
  color: #2c3e50;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  
  &:hover {
    background-color: #dde4e6;
  }
`;

const SubmitButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
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

const NavButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: ${props => props.primary ? '#2c3e50' : '#ecf0f1'};
  color: ${props => props.primary ? 'white' : '#2c3e50'};
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.primary ? '#1a252f' : '#dde4e6'};
  }
  
  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;

const FormProgress = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
`;

const ProgressStep = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100px;
  position: relative;
  
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 12px;
    right: -50%;
    width: 100%;
    height: 2px;
    background-color: ${props => props.active || props.completed ? '#3498db' : '#ecf0f1'};
    z-index: 1;
  }
`;

const StepCircle = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${props => props.active ? '#3498db' : props.completed ? '#27ae60' : '#ecf0f1'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  margin-bottom: 8px;
  z-index: 2;
`;

const StepLabel = styled.div`
  font-size: 0.75rem;
  color: ${props => props.active ? '#3498db' : props.completed ? '#27ae60' : '#7f8c8d'};
  text-align: center;
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  margin-top: 0.5rem;
  font-size: 0.875rem;
`;

const ClientsPage = ({ user, onLogout }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    company_name: '',
    industry: '',
    email: '',
    phone: '',
    age: '',
    risk_profile: '',
    currency: 'USD'
  });
  const [formPage, setFormPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.apiUrl}/api/clients`, { withCredentials: true });
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchClients();
  }, []);
  
  const handleOpenModal = (client = null) => {
    if (client) {
      setClientToEdit(client);
      setFormData({
        name: client.name || '',
        surname: client.surname || '',
        company_name: client.company_name || '',
        industry: client.industry || '',
        contact_person: client.contact_person || '',
        email: client.email || '',
        phone: client.phone || '',
        age: client.age || '',
        risk_profile: client.risk_profile || '',
        currency: client.currency || 'USD'
      });
    } else {
      setClientToEdit(null);
      setFormData({
        name: '',
        surname: '',
        company_name: '',
        industry: '',
        contact_person: '',
        email: '',
        phone: '',
        age: '',
        risk_profile: '',
        currency: 'USD'
      });
    }
    setFormPage(1);
    setModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setModalOpen(false);
    setError('');
    setFormPage(1);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleNextPage = (e) => {
    e.preventDefault();
    // Validate required fields on page 1
    if (!formData.name) {
      setError('First name is required');
      return;
    }
    setError('');
    setFormPage(2);
  };
  
  const handlePrevPage = () => {
    setFormPage(1);
    setError('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    
    try {
      // Create a cleaned version of the form data
      const cleanedData = {
        ...formData,
        // If age is empty string, send null
        age: formData.age === '' ? null : formData.age
      };
      
      if (clientToEdit) {
        // Update existing client
        const response = await axios.put(
          `${config.apiUrl}/api/clients/${clientToEdit.id}`, 
          cleanedData, 
          { withCredentials: true }
        );
        
        setClients(prev => prev.map(client => 
          client.id === clientToEdit.id ? response.data : client
        ));
      } else {
        // Create new client
        const response = await axios.post(
          `${config.apiUrl}/api/clients`, 
          cleanedData, 
          { withCredentials: true }
        );
        
        setClients(prev => [...prev, response.data]);
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('Client save error:', error);
      setError(error.response?.data?.message || 'An error occurred while saving the client');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('Are you sure you want to delete this client? This will also delete all associated meetings and transcripts.')) {
      return;
    }
    
    try {
      await axios.delete(`${config.apiUrl}/api/clients/${clientId}`, { withCredentials: true });
      setClients(prev => prev.filter(client => client.id !== clientId));
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Failed to delete client. Please try again.');
    }
  };
  
  if (loading) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <LoadingSpinner>
          <FaSpinner size={24} />
        </LoadingSpinner>
      </Layout>
    );
  }
  
  const renderFormPage1 = () => (
    <>
      <ModalFormGroup>
        <ModalLabel htmlFor="name">First Name *</ModalLabel>
        <ModalInput
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
      </ModalFormGroup>
      
      <ModalFormGroup>
        <ModalLabel htmlFor="surname">Last Name</ModalLabel>
        <ModalInput
          type="text"
          id="surname"
          name="surname"
          value={formData.surname}
          onChange={handleInputChange}
        />
      </ModalFormGroup>
      
      <ModalFormGroup>
        <ModalLabel htmlFor="company_name">Company Name</ModalLabel>
        <ModalInput
          type="text"
          id="company_name"
          name="company_name"
          value={formData.company_name}
          onChange={handleInputChange}
        />
      </ModalFormGroup>
      
      <ModalFormGroup>
        <ModalLabel htmlFor="email">Email</ModalLabel>
        <ModalInput
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
        />
      </ModalFormGroup>
      
      <ModalFormGroup>
        <ModalLabel htmlFor="phone">Phone</ModalLabel>
        <ModalInput
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
        />
      </ModalFormGroup>
    </>
  );
  
  const renderFormPage2 = () => (
    <>
      <ModalFormGroup>
        <ModalLabel htmlFor="industry">Industry</ModalLabel>
        <ModalInput
          type="text"
          id="industry"
          name="industry"
          value={formData.industry}
          onChange={handleInputChange}
        />
      </ModalFormGroup>
      
      <ModalFormGroup>
        <ModalLabel htmlFor="age">Age</ModalLabel>
        <ModalInput
          type="number"
          id="age"
          name="age"
          value={formData.age}
          onChange={handleInputChange}
          min="0"
          max="120"
        />
      </ModalFormGroup>
      
      <ModalFormGroup>
        <ModalLabel htmlFor="risk_profile">Risk Profile</ModalLabel>
        <ModalSelect
          id="risk_profile"
          name="risk_profile"
          value={formData.risk_profile}
          onChange={handleInputChange}
        >
          <option value="">Select Risk Profile</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </ModalSelect>
      </ModalFormGroup>
      
      <ModalFormGroup>
        <ModalLabel htmlFor="currency">Default Currency</ModalLabel>
        <ModalSelect
          id="currency"
          name="currency"
          value={formData.currency}
          onChange={handleInputChange}
        >
          <option value="USD">US Dollar (USD)</option>
          <option value="EUR">Euro (EUR)</option>
          <option value="GBP">British Pound (GBP)</option>
          <option value="ZAR">South African Rand (ZAR)</option>
          <option value="CHF">Swiss Franc (CHF)</option>
          <option value="CNY">Chinese Yuan (CNY)</option>
        </ModalSelect>
      </ModalFormGroup>
    </>
  );
  
  return (
    <Layout user={user} onLogout={onLogout}>
      <PageHeader>
        <PageTitle>Clients</PageTitle>
        <AddButton onClick={() => handleOpenModal()}>
          <FaPlus size={12} />
          Add Client
        </AddButton>
      </PageHeader>
      
      {clients.length === 0 ? (
        <EmptyState>
          <EmptyStateText>No clients found. Add your first client to get started!</EmptyStateText>
          <AddButton onClick={() => handleOpenModal()}>
            <FaPlus size={12} />
            Add Client
          </AddButton>
        </EmptyState>
      ) : (
        <ClientsGrid>
          {clients.map(client => (
            <ClientCard key={client.id}>
              <ClientHeader>
                <ClientName to={`/clients/${client.id}`}>
                  {client.name} {client.surname}
                </ClientName>
                {client.company_name && <CompanyName>{client.company_name}</CompanyName>}
              </ClientHeader>
              
              <ClientDetails>
                {client.email && (
                  <ClientDetail>
                    <DetailLabel>Email</DetailLabel>
                    <DetailValue>{client.email}</DetailValue>
                  </ClientDetail>
                )}
                
                {client.phone && (
                  <ClientDetail>
                    <DetailLabel>Phone</DetailLabel>
                    <DetailValue>{client.phone}</DetailValue>
                  </ClientDetail>
                )}
                
                {client.currency && (
                  <ClientDetail>
                    <DetailLabel>Currency</DetailLabel>
                    <DetailValue>{client.currency}</DetailValue>
                  </ClientDetail>
                )}
              </ClientDetails>
              
              <ClientActions>
                <ActionButton onClick={() => handleOpenModal(client)} title="Edit Client">
                  <FaEdit size={16} />
                </ActionButton>
                <ActionButton onClick={() => handleDeleteClient(client.id)} title="Delete Client">
                  <FaTrash size={16} />
                </ActionButton>
              </ClientActions>
            </ClientCard>
          ))}
        </ClientsGrid>
      )}
      
      {/* Client Modal */}
      {modalOpen && (
        <Modal>
          <ModalContent>
            <ModalTitle>{clientToEdit ? 'Edit Client' : 'Add New Client'}</ModalTitle>
            
            <FormProgress>
              <ProgressStep active={formPage === 1} completed={formPage > 1}>
                <StepCircle active={formPage === 1} completed={formPage > 1}>
                  {formPage > 1 ? <FaCheck size={10} /> : 1}
                </StepCircle>
                <StepLabel active={formPage === 1} completed={formPage > 1}>Basic Info</StepLabel>
              </ProgressStep>
              <ProgressStep active={formPage === 2}>
                <StepCircle active={formPage === 2}>2</StepCircle>
                <StepLabel active={formPage === 2}>Additional Info</StepLabel>
              </ProgressStep>
            </FormProgress>
            
            <ModalForm onSubmit={formPage === 1 ? handleNextPage : handleSubmit}>
              {formPage === 1 ? renderFormPage1() : renderFormPage2()}
              
              {error && <ErrorMessage>{error}</ErrorMessage>}
              
              <ModalButtonGroup>
                {formPage === 1 ? (
                  <>
                    <CancelButton type="button" onClick={handleCloseModal}>
                      Cancel
                    </CancelButton>
                    <NavButton type="submit" primary>
                      Next
                      <FaArrowRight size={12} />
                    </NavButton>
                  </>
                ) : (
                  <>
                    <NavButton type="button" onClick={handlePrevPage}>
                      <FaArrowLeft size={12} />
                      Back
                    </NavButton>
                    <SubmitButton type="submit" disabled={submitting}>
                      {submitting ? 'Saving...' : clientToEdit ? 'Save Changes' : 'Create Client'}
                    </SubmitButton>
                  </>
                )}
              </ModalButtonGroup>
            </ModalForm>
          </ModalContent>
        </Modal>
      )}
    </Layout>
  );
};

export default ClientsPage;