import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import Layout from '../components/Layout';
import EditableFacts from '../components/EditableFacts';
import { FaEdit, FaTrash, FaSpinner, FaArrowLeft, FaFileAudio, FaCalendarAlt, FaUser, FaExclamationTriangle, FaCheck, FaSyncAlt } from 'react-icons/fa';
import config from '../config';

const MeetingDetailContainer = styled.div`
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

const MeetingHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const MeetingHeaderInfo = styled.div`
  flex: 1;
`;

const MeetingTitle = styled.h1`
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
`;

const MeetingMeta = styled.div`
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

const MeetingActions = styled.div`
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

const Section = styled.section`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
`;

const SectionTitle = styled.h2`
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
`;

const TranscriptStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const StatusText = styled.div`
  font-weight: 600;
  
  ${props => {
    if (props.status === 'completed') {
      return `color: #27ae60;`;
    } else if (props.status === 'processing') {
      return `color: #3498db;`;
    } else if (props.status === 'failed') {
      return `color: #e74c3c;`;
    } else {
      return `color: #7f8c8d;`;
    }
  }}
`;

const FileUploadForm = styled.form`
  margin-top: 1rem;
`;

const FileInputLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #2c3e50;
  color: white;
  border-radius: 4px;
  padding: 0.75rem 1rem;
  cursor: pointer;
  font-size: 0.875rem;
  
  &:hover {
    background-color: #1a252f;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const UploadButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1rem;
  margin-left: 1rem;
  cursor: pointer;
  font-size: 0.875rem;
  
  &:hover {
    background-color: #1a252f;
  }
  
  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;

const FileName = styled.div`
  display: inline-block;
  margin-left: 1rem;
  font-size: 0.875rem;
  color: #7f8c8d;
`;

const TabsContainer = styled.div`
  margin-top: 1.5rem;
`;

const TabsHeader = styled.div`
  display: flex;
  border-bottom: 1px solid #ecf0f1;
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${props => props.active ? '#f8f9fa' : 'transparent'};
  border: none;
  border-bottom: 3px solid ${props => props.active ? '#3498db' : 'transparent'};
  color: ${props => props.active ? '#2c3e50' : '#7f8c8d'};
  font-weight: ${props => props.active ? '600' : 'normal'};
  cursor: pointer;
  
  &:hover {
    color: #2c3e50;
  }
`;

const TabContent = styled.div`
  padding: 1.5rem 0;
`;

const TranscriptText = styled.div`
  white-space: pre-wrap;
  line-height: 1.6;
`;

const FactsList = styled.ul`
  padding-left: 1.5rem;
  line-height: 1.6;
`;

const FactItem = styled.li`
  margin-bottom: 0.5rem;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
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

const MeetingDetail = ({ user, onLogout }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailContent, setEmailContent] = useState('');
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [editedMeeting, setEditedMeeting] = useState({
    client_id: '',
    title: '',
    meeting_date: '',
    participants: ''
  });
  const [clients, setClients] = useState([]);
  const [activeTab, setActiveTab] = useState('transcript');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch meeting details
        const meetingResponse = await axios.get(`${config.apiUrl}/api/meetings/${id}`, { withCredentials: true });
        setMeeting(meetingResponse.data);
        setEditedMeeting({
          client_id: meetingResponse.data.client_id,
          title: meetingResponse.data.title,
          meeting_date: new Date(meetingResponse.data.meeting_date).toISOString().slice(0, 16),
          participants: meetingResponse.data.participants || ''
        });
        
        // Fetch clients for edit form
        const clientsResponse = await axios.get(`${config.apiUrl}/api/clients`, { withCredentials: true });
        setClients(clientsResponse.data);
      } catch (error) {
        console.error('Error fetching meeting data:', error);
        if (error.response?.status === 404) {
          navigate('/not-found');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, navigate]);
  
  // Polling for meeting status updates when processing
  useEffect(() => {
    let intervalId;
    
    if (meeting && meeting.status === 'processing') {
      intervalId = setInterval(async () => {
        try {
          const response = await axios.get(`${config.apiUrl}/api/meetings/${id}`, { withCredentials: true });
          setMeeting(response.data);
          
          if (response.data.status !== 'processing') {
            clearInterval(intervalId);
          }
        } catch (error) {
          console.error('Error polling meeting status:', error);
        }
      }, 5000); // Poll every 5 seconds
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [id, meeting]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedMeeting(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const handleFileUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      return;
    }
    
    setUploading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('audio_file', selectedFile);
      
      const response = await axios.post(`${config.apiUrl}/api/meetings/${id}/upload`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setMeeting(response.data);
      setSelectedFile(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to upload audio file');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };
  
  const handleUpdateMeeting = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    
    try {
      const response = await axios.put(`${config.apiUrl}/api/meetings/${id}`, editedMeeting, { withCredentials: true });
      
      // Update meeting in state
      setMeeting(prev => ({
        ...prev,
        ...response.data
      }));
      
      // Close modal
      setEditModalOpen(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update meeting');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleRefreshMeeting = async () => {
    setRefreshing(true);
    
    try {
      const response = await axios.get(`${config.apiUrl}/api/meetings/${id}`, { withCredentials: true });
      setMeeting(response.data);
    } catch (error) {
      console.error('Error refreshing meeting:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  const handleDeleteMeeting = async () => {
    if (!window.confirm('Are you sure you want to delete this meeting? This action cannot be undone.')) {
      return;
    }
    
    try {
      await axios.delete(`${config.apiUrl}/api/meetings/${id}`, { withCredentials: true });
      navigate(`/clients/${meeting.client_id}`);
    } catch (error) {
      console.error('Error deleting meeting:', error);
      alert('Failed to delete meeting. Please try again.');
    }
  };
  
  const handleGenerateEmail = async () => {
    setGeneratingEmail(true);
    
    try {
      // Fetch client data
      axios.get(`${config.apiUrl}/api/clients`)
      // const clientResponse = await axios.get(`/api/clients/${meeting.client_id}`, { 
      const clientResponse = await axios.get(`${config.apiUrl}/api/clients/${meeting.client_id}`, { 
        withCredentials: true 
      });
      
      const client = clientResponse.data;
      
      // Check if the transcript exists
      if (!meeting.transcript || !meeting.transcript.full_text) {
        alert('No transcript found. Please ensure the meeting has a completed transcript.');
        setGeneratingEmail(false);
        return;
      }
      
      // Prepare data for the API call
      const emailData = {
        transcript: meeting.transcript.full_text,
        hardFacts: meeting.transcript.hard_facts || [],
        softFacts: meeting.transcript.soft_facts || [],
        meetingTitle: meeting.title,
        meetingDate: meeting.meeting_date,
        clientName: client.name + (client.surname ? ' ' + client.surname : ''),
        clientCompany: client.company_name || client.name,
        userCompany: 'Advanced Insight',
        userName: 'Ryan McCarlie'
      };
      
      console.log('Sending email generation request with data:', emailData);
      
      // Generate email using OpenAI
      const response = await axios.post(`${config.apiUrl}/api/transcripts/generate-email`, emailData, { 
        withCredentials: true,
        timeout: 30000 // Increase timeout for OpenAI calls
      });
      
      setEmailContent(response.data.email);
      setEmailModalOpen(true);
    } catch (error) {
      console.error('Error generating email:', error);
      
      let errorMessage = 'Failed to generate email summary.';
      
      if (error.response && error.response.data) {
        errorMessage += ' ' + (error.response.data.message || error.response.data);
      } else if (error.message) {
        errorMessage += ' ' + error.message;
      }
      
      alert(errorMessage + ' Please try again.');
    } finally {
      setGeneratingEmail(false);
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
      <BackLink to="/meetings">
        <FaArrowLeft size={14} />
        Back to Meetings
      </BackLink>
      
      <MeetingDetailContainer>
        <MeetingHeader>
          <MeetingHeaderInfo>
            <MeetingTitle>{meeting.title}</MeetingTitle>
            <MeetingMeta>
              <MetaItem>
                <FaCalendarAlt size={14} />
                <MetaValue>
                  {new Date(meeting.meeting_date).toLocaleDateString()} at {new Date(meeting.meeting_date).toLocaleTimeString()}
                </MetaValue>
              </MetaItem>
              <MetaItem>
                <FaUser size={14} />
                <MetaValue>{meeting.client_name}</MetaValue>
              </MetaItem>
            </MeetingMeta>
            {meeting.participants && (
              <MetaItem style={{ marginTop: '0.5rem' }}>
                <MetaLabel>Participants:</MetaLabel>
                <MetaValue>{meeting.participants}</MetaValue>
              </MetaItem>
            )}
          </MeetingHeaderInfo>
          
          <MeetingActions>
            <EditButton onClick={() => setEditModalOpen(true)}>
              <FaEdit size={14} />
              Edit
            </EditButton>
            <DeleteButton onClick={handleDeleteMeeting}>
              <FaTrash size={14} />
              Delete
            </DeleteButton>
          </MeetingActions>
        </MeetingHeader>
        
        <Section>
          <SectionTitle>Transcript</SectionTitle>
          
          <TranscriptStatus>
            {meeting.status === 'pending' && (
              <>
                <StatusText status="pending">No audio file uploaded</StatusText>
              </>
            )}
            {meeting.status === 'processing' && (
              <>
                <FaSyncAlt size={16} />
                <StatusText status="processing">Processing audio...</StatusText>
              </>
            )}
            {meeting.status === 'completed' && (
              <>
                <FaCheck size={16} />
                <StatusText status="completed">Transcript completed</StatusText>
              </>
            )}
            {meeting.status === 'failed' && (
              <>
                <FaExclamationTriangle size={16} />
                <StatusText status="failed">Transcription failed</StatusText>
              </>
            )}
            
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
              {meeting.status === 'completed' && (
                <ActionButton onClick={handleGenerateEmail} style={{ backgroundColor: '#3498db' }}>
                  Generate Email Summary
                </ActionButton>
              )}
              
              {meeting.status === 'processing' && (
                <ActionButton onClick={handleRefreshMeeting} disabled={refreshing}>
                  {refreshing ? <FaSpinner size={14} /> : <FaSpinner size={14} />} 
                  Refresh
                </ActionButton>
              )}
            </div>
          </TranscriptStatus>
          
          {meeting.status === 'pending' && (
            <FileUploadForm onSubmit={handleFileUpload}>
              <FileInputLabel>
                <FaFileAudio size={14} />
                Select Audio File
                <HiddenFileInput 
                  type="file" 
                  accept=".mp3,.wav,.m4a,.ogg" 
                  onChange={handleFileChange} 
                />
              </FileInputLabel>
              
              {selectedFile && (
                <>
                  <FileName>{selectedFile.name}</FileName>
                  <UploadButton type="submit" disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Upload'}
                  </UploadButton>
                </>
              )}
              
              {error && <ErrorMessage>{error}</ErrorMessage>}
            </FileUploadForm>
          )}
          
          {(meeting.status === 'failed' || meeting.status === 'completed') && (
            <FileUploadForm onSubmit={handleFileUpload}>
              <FileInputLabel>
                <FaFileAudio size={14} />
                {meeting.status === 'failed' ? 'Try a different file' : 'Replace audio file'}
                <HiddenFileInput 
                  type="file" 
                  accept=".mp3,.wav,.m4a,.ogg" 
                  onChange={handleFileChange} 
                />
              </FileInputLabel>
              
              {selectedFile && (
                <>
                  <FileName>{selectedFile.name}</FileName>
                  <UploadButton type="submit" disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Upload'}
                  </UploadButton>
                </>
              )}
              
              {error && <ErrorMessage>{error}</ErrorMessage>}
            </FileUploadForm>
          )}
          
          {meeting.status === 'completed' && meeting.transcript && (
            <TabsContainer>
              <TabsHeader>
                <Tab 
                  active={activeTab === 'transcript'} 
                  onClick={() => setActiveTab('transcript')}
                >
                  Full Transcript
                </Tab>
                <Tab 
                  active={activeTab === 'hard-facts'} 
                  onClick={() => setActiveTab('hard-facts')}
                >
                  Hard Facts
                </Tab>
                <Tab 
                  active={activeTab === 'soft-facts'} 
                  onClick={() => setActiveTab('soft-facts')}
                >
                  Soft Facts
                </Tab>
              </TabsHeader>
              
              <TabContent>
                {activeTab === 'transcript' && (
                  <TranscriptText>
                    {meeting.transcript.full_text}
                  </TranscriptText>
                )}
                
                {activeTab === 'hard-facts' && (
                  meeting.transcript && meeting.transcript.hard_facts ? (
                    <EditableFacts 
                      facts={meeting.transcript.hard_facts} 
                      setFacts={(updatedFacts) => {
                        setMeeting(prev => ({
                          ...prev,
                          transcript: {
                            ...prev.transcript,
                            hard_facts: updatedFacts
                          }
                        }));
                        
                        // Update in the database
                        if (meeting.transcript.id) {
                          axios.put(`${config.apiUrl}/api/transcripts/${meeting.transcript.id}`, {
                            ...meeting.transcript,
                            hard_facts: updatedFacts
                          }, { withCredentials: true }).catch(err => {
                            console.error('Error updating hard facts:', err);
                          });
                        }
                      }}
                      factType="hard"
                    />
                  ) : (
                    <EmptyState>No hard facts identified</EmptyState>
                  )
                )}
                
                {activeTab === 'soft-facts' && (
                  meeting.transcript && meeting.transcript.soft_facts ? (
                    <EditableFacts 
                      facts={meeting.transcript.soft_facts} 
                      setFacts={(updatedFacts) => {
                        setMeeting(prev => ({
                          ...prev,
                          transcript: {
                            ...prev.transcript,
                            soft_facts: updatedFacts
                          }
                        }));
                        
                        // Update in the database
                        if (meeting.transcript.id) {
                          axios.put(`${config.apiUrl}/api/transcripts/${meeting.transcript.id}`, {
                            ...meeting.transcript,
                            soft_facts: updatedFacts
                          }, { withCredentials: true }).catch(err => {
                            console.error('Error updating soft facts:', err);
                          });
                        }
                      }}
                      factType="soft"
                    />
                  ) : (
                    <EmptyState>No soft facts identified</EmptyState>
                  )
                )}
              </TabContent>
            </TabsContainer>
          )}
          
          {meeting.status === 'completed' && !meeting.transcript && (
            <EmptyState>
              <FaExclamationTriangle size={24} />
              <div>Transcript data not found. There might have been an issue processing this meeting.</div>
            </EmptyState>
          )}
        </Section>
      </MeetingDetailContainer>
      
      {/* Edit Meeting Modal */}
      {editModalOpen && (
        <Modal>
          <ModalContent>
            <ModalTitle>Edit Meeting</ModalTitle>
            <ModalForm onSubmit={handleUpdateMeeting}>
              <ModalFormGroup>
                <ModalLabel htmlFor="client_id">Client *</ModalLabel>
                <ModalSelect
                  id="client_id"
                  name="client_id"
                  value={editedMeeting.client_id}
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
                  value={editedMeeting.title}
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
                  value={editedMeeting.meeting_date}
                  onChange={handleInputChange}
                  required
                />
              </ModalFormGroup>
              
              <ModalFormGroup>
                <ModalLabel htmlFor="participants">Participants</ModalLabel>
                <ModalTextarea
                  id="participants"
                  name="participants"
                  value={editedMeeting.participants}
                  onChange={handleInputChange}
                  placeholder="Enter participant names, roles, etc."
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

      {/* Email Summary Modal */}
      {emailModalOpen && (
        <Modal>
          <ModalContent style={{ maxWidth: '700px' }}>
            <ModalTitle>Generated Email Summary</ModalTitle>
            
            <div>
              <pre 
                style={{ 
                  whiteSpace: 'pre-wrap', 
                  fontFamily: 'inherit',
                  background: '#f8f9fa',
                  padding: '1rem',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  border: '1px solid #e9ecef'
                }}
              >
                {emailContent}
              </pre>
            </div>
            
            <ModalButtonGroup>
              <CancelButton type="button" onClick={() => setEmailModalOpen(false)}>
                Close
              </CancelButton>
              <SubmitButton 
                type="button" 
                onClick={() => {
                  navigator.clipboard.writeText(emailContent);
                  alert('Email copied to clipboard!');
                }}
              >
                Copy to Clipboard
              </SubmitButton>
            </ModalButtonGroup>
          </ModalContent>
        </Modal>
      )}
    </Layout>
  );
}

export default MeetingDetail;