import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import Layout from '../components/Layout';
import { FaPlus, FaUser, FaCalendarAlt, FaFileAudio, FaSpinner, FaChartBar, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import config from '../config';

// Styled Components
const DashboardWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const DashboardCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #ecf0f1;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardTitle = styled.h2`
  color: #2c3e50;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const CardBody = styled.div`
  padding: 1.5rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1.5rem;
`;

const StatCard = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const StatValue = styled.div`
  color: #2c3e50;
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #7f8c8d;
  font-size: 0.875rem;
`;

const SeeAllLink = styled(Link)`
  color: #3498db;
  font-size: 0.875rem;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    text-decoration: underline;
  }
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

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li`
  padding: 1rem 0;
  border-bottom: 1px solid #ecf0f1;
  
  &:last-child {
    border-bottom: none;
  }
`;

const MeetingItem = styled(Link)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-decoration: none;
  color: inherit;
  
  &:hover h3 {
    color: #3498db;
  }
`;

const MeetingInfo = styled.div``;

const MeetingTitle = styled.h3`
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  color: #2c3e50;
  transition: color 0.2s;
`;

const MeetingMeta = styled.div`
  color: #7f8c8d;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ClientItem = styled(Link)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-decoration: none;
  color: inherit;
  
  &:hover h3 {
    color: #3498db;
  }
`;

const ClientInfo = styled.div``;

const ClientName = styled.h3`
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  color: #2c3e50;
  transition: color 0.2s;
`;

const ClientMeta = styled.div`
  color: #7f8c8d;
  font-size: 0.875rem;
`;

const MetaItem = styled.span`
  display: inline-flex;
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

const FullWidthCard = styled(DashboardCard)`
  grid-column: 1 / -1;
`;

const ActivityTitle = styled.h3`
  font-size: 1rem;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ActivityItem = styled.div`
  display: flex;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #ecf0f1;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ActivityIconWrapper = styled.div`
  background-color: ${props => {
    if (props.type === 'success') return '#e6f7ed';
    if (props.type === 'warning') return '#fdeaec';
    return '#e5f0fd';
  }};
  color: ${props => {
    if (props.type === 'success') return '#27ae60';
    if (props.type === 'warning') return '#e74c3c';
    return '#3498db';
  }};
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ActivityContent = styled.div``;

const ActivityText = styled.div`
  color: #2c3e50;
  margin-bottom: 0.25rem;
`;

const ActivityTime = styled.div`
  color: #7f8c8d;
  font-size: 0.75rem;
`;

const ActivityLink = styled(Link)`
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

// Dashboard Component
const Dashboard = ({ user, onLogout }) => {
  const [clients, setClients] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [stats, setStats] = useState({
    totalClients: 0,
    totalMeetings: 0,
    completedTranscripts: 0,
    pendingTranscripts: 0
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch clients
        const clientsResponse = await axios.get(`${config.apiUrl}/api/clients`, { withCredentials: true });
        setClients(clientsResponse.data);
        
        // Fetch meetings
        const meetingsResponse = await axios.get(`${config.apiUrl}/api/meetings`, { withCredentials: true });
        setMeetings(meetingsResponse.data);
        
        // Calculate stats
        const completedTranscripts = meetingsResponse.data.filter(m => m.status === 'completed').length;
        const pendingTranscripts = meetingsResponse.data.filter(m => m.status === 'pending' || m.status === 'processing').length;
        
        setStats({
          totalClients: clientsResponse.data.length,
          totalMeetings: meetingsResponse.data.length,
          completedTranscripts,
          pendingTranscripts
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Generate some activity items based on meetings data
  const getActivityItems = () => {
    if (!meetings.length) return [];
    
    const activities = [];
    
    // Get recent meetings
    const recentMeetings = [...meetings]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3);
    
    recentMeetings.forEach(meeting => {
      const activityType = 
        meeting.status === 'completed' ? 'success' : 
        meeting.status === 'failed' ? 'warning' : 'info';
      
      const activityText = 
        meeting.status === 'completed' ? 'Transcript completed for' : 
        meeting.status === 'failed' ? 'Transcription failed for' : 
        meeting.status === 'processing' ? 'Processing audio for' : 
        'Created meeting';
      
      activities.push({
        id: `meeting-${meeting.id}`,
        type: activityType,
        text: `${activityText} "${meeting.title}"`,
        time: new Date(meeting.created_at).toLocaleString(),
        link: `/meetings/${meeting.id}`
      });
    });
    
    return activities;
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
      <DashboardWrapper>
        <FullWidthCard>
          <CardHeader>
            <CardTitle>
              <FaChartBar size={18} />
              Overview
            </CardTitle>
          </CardHeader>
          <CardBody>
            <StatsGrid>
              <StatCard>
                <StatValue>{stats.totalClients}</StatValue>
                <StatLabel>Clients</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats.totalMeetings}</StatValue>
                <StatLabel>Meetings</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats.completedTranscripts}</StatValue>
                <StatLabel>Completed Transcripts</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats.pendingTranscripts}</StatValue>
                <StatLabel>Pending Transcripts</StatLabel>
              </StatCard>
            </StatsGrid>
          </CardBody>
        </FullWidthCard>
        
        <DashboardCard>
          <CardHeader>
            <CardTitle>
              <FaCalendarAlt size={18} />
              Recent Meetings
            </CardTitle>
            <SeeAllLink to="/meetings">
              See All
            </SeeAllLink>
          </CardHeader>
          <CardBody>
            {meetings.length === 0 ? (
              <EmptyState>
                No meetings found. Create your first meeting!
                <div style={{ marginTop: '1rem' }}>
                  <AddButton to="/meetings">
                    <FaPlus size={12} />
                    Add Meeting
                  </AddButton>
                </div>
              </EmptyState>
            ) : (
              <List>
                {meetings.slice(0, 5).map(meeting => (
                  <ListItem key={meeting.id}>
                    <MeetingItem to={`/meetings/${meeting.id}`}>
                      <MeetingInfo>
                        <MeetingTitle>{meeting.title}</MeetingTitle>
                        <MeetingMeta>
                          <MetaItem>
                            <FaUser size={12} />
                            {meeting.client_name}
                          </MetaItem>
                          <MetaItem>
                            <FaCalendarAlt size={12} />
                            {new Date(meeting.meeting_date).toLocaleDateString()}
                          </MetaItem>
                        </MeetingMeta>
                      </MeetingInfo>
                      <StatusBadge status={meeting.status}>
                        {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                      </StatusBadge>
                    </MeetingItem>
                  </ListItem>
                ))}
              </List>
            )}
          </CardBody>
        </DashboardCard>
        
        <DashboardCard>
          <CardHeader>
            <CardTitle>
              <FaUser size={18} />
              Clients
            </CardTitle>
            <SeeAllLink to="/clients">
              See All
            </SeeAllLink>
          </CardHeader>
          <CardBody>
            {clients.length === 0 ? (
              <EmptyState>
                No clients found. Create your first client!
                <div style={{ marginTop: '1rem' }}>
                  <AddButton to="/clients">
                    <FaPlus size={12} />
                    Add Client
                  </AddButton>
                </div>
              </EmptyState>
            ) : (
              <List>
                {clients.slice(0, 5).map(client => (
                  <ListItem key={client.id}>
                    <ClientItem to={`/clients/${client.id}`}>
                      <ClientInfo>
                        <ClientName>{client.name}</ClientName>
                        {client.industry && (
                          <ClientMeta>{client.industry}</ClientMeta>
                        )}
                      </ClientInfo>
                    </ClientItem>
                  </ListItem>
                ))}
              </List>
            )}
          </CardBody>
        </DashboardCard>
        
        <FullWidthCard>
          <CardHeader>
            <CardTitle>
              <FaFileAudio size={18} />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardBody>
            {getActivityItems().length === 0 ? (
              <EmptyState>No recent activity to display.</EmptyState>
            ) : (
              <ActivityList>
                {getActivityItems().map(activity => (
                  <ActivityItem key={activity.id}>
                    <ActivityIconWrapper type={activity.type}>
                      {activity.type === 'success' && <FaCheck size={16} />}
                      {activity.type === 'warning' && <FaExclamationTriangle size={16} />}
                      {activity.type === 'info' && <FaCalendarAlt size={16} />}
                    </ActivityIconWrapper>
                    <ActivityContent>
                      <ActivityText>
                        {activity.text.split('"')[0]}
                        <ActivityLink to={activity.link}>
                          {activity.text.split('"')[1]}
                        </ActivityLink>
                        "
                      </ActivityText>
                      <ActivityTime>{activity.time}</ActivityTime>
                    </ActivityContent>
                  </ActivityItem>
                ))}
              </ActivityList>
            )}
          </CardBody>
        </FullWidthCard>
      </DashboardWrapper>
    </Layout>
  );
};

export default Dashboard;