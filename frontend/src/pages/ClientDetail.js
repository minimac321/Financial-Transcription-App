import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import Layout from '../components/Layout';
import { FaEdit, FaTrash, FaPlus, FaSpinner, FaCalendarAlt, FaArrowLeft, FaFileAudio } from 'react-icons/fa';
import config from '../config';

const ClientDetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #2c3e50;
  text-decoration: none;
  margin-bottom: 1rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ClientHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ClientInfo = styled.div`
  flex: 1;
`;

const ClientName = styled.h1`
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
`;

const ClientMeta = styled.div`
  color: #7f8c8d;
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-top: 0.5rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const MetaLabel = styled.span`
  font-weight: 600;
`;

const MetaValue = styled.span``;

const ClientActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  
  @media (min-width: 768px) {
    margin-top: 0;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  font-size: 0.875rem;
  cursor: pointer;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const EditButton = styled(ActionButton)`
  background-color: #3498db;
  color: white;
  
  &:hover:not(:disabled) {
    background-color: #2980b9;
  }
`;

const DeleteButton = styled(ActionButton)`
  background-color: #e74c3c;
  color: white;
  
  &:hover:not(:disabled) {
    background-color: #c0392b;
  }
`;

const MeetingsSection = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #ecf0f1;
`;

const SectionTitle = styled.h2`
  color: #2c3e50;
  margin: 0;
  font-size: 1.25rem;
`;

const AddButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #2c3e50;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  
  &:hover {
    background-color: #1a252f;
  }
`;

const MeetingsList = styled.div`
  padding: 0;
`;

const MeetingCard = styled(Link)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #ecf0f1;
  text-decoration: none;
  color: inherit;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: #f8f9fa;
  }
`;

const MeetingInfo = styled.div`
  flex: 1;
`;

const MeetingTitle = styled.div`
  font-weight: 600;
  color: #2c3e50;
`;

const MeetingDate = styled.div`
  color: #7f8c8d;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  
  ${props => {
    if (props.status === 'completed') {
      return `
        background-color: #e6f7ed;
        color: #27ae60;
      `;
    } else if (props.status === 'processing') {
      return `
        background-color: #e5f0fd;
        color: #3498db;
      `;
    } else if (props.status === 'failed') {
      return `
        background-color: #fdeaec;
        color: #e74c3c;
      `;
    } else {
      return `
        background-color: #f5f5f5;
        color: #7f8c8d;
      `;
    }
  }}
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  padding: 2rem;
  color: #7f8c8d;
`;

const EmptyState = styled.div`
  text-align: center;
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
  padding: 2rem;
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

const ModalButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
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

const ErrorMessage = styled.div`
  color: #e74c3c;
  margin-top: 0.5rem;
  font-size: 0.875rem;
`;

const ClientDetail = ({ user, onLogout }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editedClient, setEditedClient] = useState({
    name: '',
    industry: '',
    contact_person: '',
    email: '',
    phone: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch client details
        // const clientResponse = await axios.get(`/api/clients/${id}`, { withCredentials: true });
        const clientResponse = await axios.get(`${config.apiUrl}/api/clients/${id}`, { withCredentials: true });
        setClient(clientResponse.data);
        setEditedClient({
          name: clientResponse.data.name,
          industry: clientResponse.data.industry || '',
          contact_person: clientResponse.data.contact_person || '',
          email: clientResponse.data.email || '',
          phone: clientResponse.data.phone || ''
        });
        
        // Fetch client meetings
        const meetingsResponse = await axios.get(`${config.apiUrl}/api/meetings/client/${id}`, { withCredentials: true });
        setMeetings(meetingsResponse.data);
      } catch (error) {
        console.error('Error fetching client data:', error);
        if (error.response?.status === 404) {
          navigate('/not-found');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, navigate]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedClient(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleUpdateClient = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    
    try {
      const response = await axios.put(`${config.apiUrl}/api/clients/${id}`, editedClient, { withCredentials: true });
      // Update client in state
      setClient(response.data);
      
      // Close modal
      setEditModalOpen(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update client');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDeleteClient = async () => {
    if (!window.confirm('Are you sure you want to delete this client? This will also delete all associated meetings and transcripts.')) {
      return;
    }
    
    try {
      await axios.delete(`${config.apiUrl}/api/clients/${id}`, { withCredentials: true });
      navigate('/');
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
  
  return (
    <Layout user={user} onLogout={onLogout}>
      <BackLink to="/clients">
        <FaArrowLeft size={14} />
        Back to Clients
      </BackLink>
      
      <ClientDetailContainer>
        <ClientHeader>
          <ClientInfo>
            <ClientName>{client.name}</ClientName>
            <ClientMeta>
              {client.industry && (
                <MetaItem>
                  <MetaLabel>Industry:</MetaLabel>
                  <MetaValue>{client.industry}</MetaValue>
                </MetaItem>
              )}
              {client.contact_person && (
                <MetaItem>
                  <MetaLabel>Contact:</MetaLabel>
                  <MetaValue>{client.contact_person}</MetaValue>
                </MetaItem>
              )}
              {client.email && (
                <MetaItem>
                  <MetaLabel>Email:</MetaLabel>
                  <MetaValue>{client.email}</MetaValue>
                </MetaItem>
              )}
              {client.phone && (
                <MetaItem>
                  <MetaLabel>Phone:</MetaLabel>
                  <MetaValue>{client.phone}</MetaValue>
                </MetaItem>
              )}
            </ClientMeta>
          </ClientInfo>
          
          <ClientActions>
            <EditButton onClick={() => setEditModalOpen(true)}>
              <FaEdit size={14} />
              Edit
            </EditButton>
            <DeleteButton onClick={handleDeleteClient}>
              <FaTrash size={14} />
              Delete
            </DeleteButton>
          </ClientActions>
        </ClientHeader>
        
        <MeetingsSection>
          <SectionHeader>
            <SectionTitle>Meetings</SectionTitle>
            <AddButton to={`/?newMeeting=${id}`}>
              <FaPlus size={12} />
              Add Meeting
            </AddButton>
          </SectionHeader>
          
          <MeetingsList>
            {meetings.length === 0 ? (
              <EmptyState>No meetings found for this client.</EmptyState>
            ) : (
              meetings.map(meeting => (
                <MeetingCard key={meeting.id} to={`/meetings/${meeting.id}`}>
                  <MeetingInfo>
                    <MeetingTitle>{meeting.title}</MeetingTitle>
                    <MeetingDate>
                      <FaCalendarAlt size={12} />
                      {new Date(meeting.meeting_date).toLocaleDateString()}
                    </MeetingDate>
                  </MeetingInfo>
                  <StatusBadge status={meeting.status}>
                    {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                  </StatusBadge>
                </MeetingCard>
              ))
            )}
          </MeetingsList>
        </MeetingsSection>
      </ClientDetailContainer>
      
      {/* Edit Client Modal */}
      {editModalOpen && (
        <Modal>
          <ModalContent>
            <ModalTitle>Edit Client</ModalTitle>
            <ModalForm onSubmit={handleUpdateClient}>
              <ModalFormGroup>
                <ModalLabel htmlFor="name">Client Name *</ModalLabel>
                <ModalInput
                  type="text"
                  id="name"
                  name="name"
                  value={editedClient.name}
                  onChange={handleInputChange}
                  required
                />
              </ModalFormGroup>
              
              <ModalFormGroup>
                <ModalLabel htmlFor="industry">Industry</ModalLabel>
                <ModalInput
                  type="text"
                  id="industry"
                  name="industry"
                  value={editedClient.industry}
                  onChange={handleInputChange}
                />
              </ModalFormGroup>
              
              <ModalFormGroup>
                <ModalLabel htmlFor="contact_person">Contact Person</ModalLabel>
                <ModalInput
                  type="text"
                  id="contact_person"
                  name="contact_person"
                  value={editedClient.contact_person}
                  onChange={handleInputChange}
                />
              </ModalFormGroup>
              
              <ModalFormGroup>
                <ModalLabel htmlFor="email">Email</ModalLabel>
                <ModalInput
                  type="email"
                  id="email"
                  name="email"
                  value={editedClient.email}
                  onChange={handleInputChange}
                />
              </ModalFormGroup>
              
              <ModalFormGroup>
                <ModalLabel htmlFor="phone">Phone</ModalLabel>
                <ModalInput
                  type="tel"
                  id="phone"
                  name="phone"
                  value={editedClient.phone}
                  onChange={handleInputChange}
                />
              </ModalFormGroup>
              
              {error && <ErrorMessage>{error}</ErrorMessage>}
              
              <ModalButtonGroup>
                <CancelButton type="button" onClick={() => setEditModalOpen(false)}>
                  Cancel
                </CancelButton>
                <SubmitButton type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </SubmitButton>
              </ModalButtonGroup>
            </ModalForm>
          </ModalContent>
        </Modal>
      )}
    </Layout>
  );
};

export default ClientDetail;