import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import Layout from '../components/Layout';
import { FaPlus, FaSpinner, FaCalendarAlt, FaUser, FaFileAudio } from 'react-icons/fa';

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

const MeetingsTable = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: minmax(200px, 2fr) minmax(150px, 1fr) minmax(120px, 1fr) minmax(120px, 1fr);
  padding: 1rem 1.5rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #ecf0f1;
  font-weight: 600;
  color: #2c3e50;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const TableHeaderCell = styled.div``;

const MeetingRow = styled(Link)`
  display: grid;
  grid-template-columns: minmax(200px, 2fr) minmax(150px, 1fr) minmax(120px, 1fr) minmax(120px, 1fr);
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #ecf0f1;
  text-decoration: none;
  color: inherit;
  transition: background-color 0.2s ease;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: #f8f9fa;
  }
  
  @media (max-width: 768px) {
    display: block;
    padding: 1rem;
  }
`;

const MeetingCell = styled.div`
  @media (max-width: 768px) {
    margin-bottom: 0.5rem;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const MeetingTitle = styled.div`
  font-weight: 600;
  color: #2c3e50;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }
`;

const MobileCellLabel = styled.span`
  display: none;
  font-weight: 600;
  margin-right: 0.5rem;
  
  @media (max-width: 768px) {
    display: inline;
  }
`;

const ClientName = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const MeetingDate = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

const ModalSelect = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const ModalTextarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
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

const MeetingsPage = ({ user, onLogout }) => {
  const [meetings, setMeetings] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    title: '',
    meeting_date: new Date().toISOString().slice(0, 16),
    participants: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch meetings
      const meetingsResponse = await axios.get('/api/meetings', { withCredentials: true });
      setMeetings(meetingsResponse.data);
      
      // Fetch clients for the modal
      const clientsResponse = await axios.get('/api/clients', { withCredentials: true });
      setClients(clientsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const handleOpenModal = () => {
    setFormData({
      client_id: clients.length > 0 ? clients[0].id : '',
      title: '',
      meeting_date: new Date().toISOString().slice(0, 16),
      participants: ''
    });
    setModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setModalOpen(false);
    setError('');
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    
    if (!formData.client_id) {
      setError('Please select a client');
      setSubmitting(false);
      return;
    }
    
    try {
      const response = await axios.post('/api/meetings', formData, { withCredentials: true });
      
      // Add clientName to the new meeting for display
      const client = clients.find(c => c.id === Number(formData.client_id));
      const newMeeting = {
        ...response.data,
        client_name: client?.name || 'Unknown Client'
      };
      
      setMeetings(prev => [newMeeting, ...prev]);
      handleCloseModal();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create meeting');
    } finally {
      setSubmitting(false);
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
      <PageHeader>
        <PageTitle>Meetings</PageTitle>
        <AddButton onClick={handleOpenModal}>
          <FaPlus size={12} />
          New Meeting
        </AddButton>
      </PageHeader>
      
      {meetings.length === 0 ? (
        <EmptyState>
          <EmptyStateText>No meetings found. Create your first meeting!</EmptyStateText>
          <AddButton onClick={handleOpenModal}>
            <FaPlus size={12} />
            New Meeting
          </AddButton>
        </EmptyState>
      ) : (
        <MeetingsTable>
          <TableHeader>
            <TableHeaderCell>Meeting</TableHeaderCell>
            <TableHeaderCell>Client</TableHeaderCell>
            <TableHeaderCell>Date</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
          </TableHeader>
          
          {meetings.map(meeting => (
            <MeetingRow key={meeting.id} to={`/meetings/${meeting.id}`}>
              <MeetingCell>
                <MeetingTitle>{meeting.title}</MeetingTitle>
              </MeetingCell>
              
              <MeetingCell>
                <MobileCellLabel>Client:</MobileCellLabel>
                <ClientName>
                  <FaUser size={12} />
                  {meeting.client_name}
                </ClientName>
              </MeetingCell>
              
              <MeetingCell>
                <MobileCellLabel>Date:</MobileCellLabel>
                <MeetingDate>
                  <FaCalendarAlt size={12} />
                  {new Date(meeting.meeting_date).toLocaleDateString()}
                </MeetingDate>
              </MeetingCell>
              
              <MeetingCell>
                <MobileCellLabel>Status:</MobileCellLabel>
                <StatusBadge status={meeting.status}>
                  {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                </StatusBadge>
              </MeetingCell>
            </MeetingRow>
          ))}
        </MeetingsTable>
      )}
      
      {/* Add Meeting Modal */}
      {modalOpen && (
        <Modal>
          <ModalContent>
            <ModalTitle>Add New Meeting</ModalTitle>
            <ModalForm onSubmit={handleSubmit}>
              <ModalFormGroup>
                <ModalLabel htmlFor="client_id">Client *</ModalLabel>
                <ModalSelect
                  id="client_id"
                  name="client_id"
                  value={formData.client_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </ModalSelect>
              </ModalFormGroup>
              
              <ModalFormGroup>
                <ModalLabel htmlFor="title">Meeting Title *</ModalLabel>
                <ModalInput
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </ModalFormGroup>
              
              <ModalFormGroup>
                <ModalLabel htmlFor="meeting_date">Meeting Date/Time *</ModalLabel>
                <ModalInput
                  type="datetime-local"
                  id="meeting_date"
                  name="meeting_date"
                  value={formData.meeting_date}
                  onChange={handleInputChange}
                  required
                />
              </ModalFormGroup>
              
              <ModalFormGroup>
                <ModalLabel htmlFor="participants">Participants</ModalLabel>
                <ModalTextarea
                  id="participants"
                  name="participants"
                  value={formData.participants}
                  onChange={handleInputChange}
                  placeholder="Enter participant names, roles, etc."
                />
              </ModalFormGroup>
              
              {error && <ErrorMessage>{error}</ErrorMessage>}
              
              <ModalButtonGroup>
                <CancelButton type="button" onClick={handleCloseModal}>
                  Cancel
                </CancelButton>
                <SubmitButton type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Meeting'}
                </SubmitButton>
              </ModalButtonGroup>
            </ModalForm>
          </ModalContent>
        </Modal>
      )}
    </Layout>
  );
};

export default MeetingsPage;