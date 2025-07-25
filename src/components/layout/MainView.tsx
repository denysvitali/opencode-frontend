import { useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import WorkspaceManagement from '../workspace/WorkspaceManagement.js';
import WorkspaceContext from '../workspace/WorkspaceContext.js';
import WorkspaceAwareChatLayout from '../workspace/WorkspaceAwareChatLayout.js';

interface MainViewProps {
  onWorkspaceUIChange?: (show: boolean) => void;
}

// Component for workspace sessions page
function WorkspaceSessionsPage({ onWorkspaceUIChange }: MainViewProps) {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();

  console.log('WorkspaceSessionsPage: COMPONENT MOUNTED with workspaceId:', workspaceId);
  console.log('WorkspaceSessionsPage: Current URL:', window.location.href);

  useEffect(() => {
    console.log('WorkspaceSessionsPage: Setting workspace UI to false');
    onWorkspaceUIChange?.(false);
  }, [onWorkspaceUIChange]);
  
  useEffect(() => {
    console.log('WorkspaceSessionsPage: workspaceId changed to:', workspaceId);
  }, [workspaceId]);

  const handleSelectSession = (sessionId: string) => {
    navigate(`/workspace/${workspaceId}/session/${sessionId}`);
  };

  const handleBackToWorkspaces = () => {
    navigate('/');
  };

  if (!workspaceId) {
    navigate('/');
    return null;
  }

  return (
    <WorkspaceContext 
      workspaceId={workspaceId}
      onBack={handleBackToWorkspaces}
      onSelectSession={handleSelectSession}
    />
  );
}

// Component for chat session page
function ChatSessionPage({ onWorkspaceUIChange }: MainViewProps) {
  const { workspaceId, sessionId } = useParams<{ workspaceId: string; sessionId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    onWorkspaceUIChange?.(false);
  }, [onWorkspaceUIChange]);

  const handleSelectSession = (sessionId: string) => {
    navigate(`/workspace/${workspaceId}/session/${sessionId}`);
  };

  const handleBackToWorkspaces = () => {
    navigate('/');
  };

  const handleBackToSessions = () => {
    navigate(`/workspace/${workspaceId}`);
  };

  if (!workspaceId || !sessionId) {
    navigate('/');
    return null;
  }

  return (
    <WorkspaceAwareChatLayout
      workspaceId={workspaceId}
      sessionId={sessionId}
      onBackToWorkspaces={handleBackToWorkspaces}
      onBackToSessions={handleBackToSessions}
      onSelectSession={handleSelectSession}
    />
  );
}

// Component for workspace management (home) page
function WorkspaceManagementPage({ onWorkspaceUIChange }: MainViewProps) {
  const navigate = useNavigate();

  useEffect(() => {
    onWorkspaceUIChange?.(false);
  }, [onWorkspaceUIChange]);

  const handleSelectWorkspace = (workspaceId: string) => {
    console.log('MainView: handleSelectWorkspace called with:', workspaceId);
    console.log('MainView: Current URL before navigation:', window.location.href);
    console.log('MainView: About to navigate to:', `/workspace/${workspaceId}`);
    
    // Navigate immediately without delay
    navigate(`/workspace/${workspaceId}`);
    console.log('MainView: Navigation command executed');
  };

  return <WorkspaceManagement onSelectWorkspace={handleSelectWorkspace} />;
}

export default function MainView({ onWorkspaceUIChange }: MainViewProps) {
  console.log('MainView: Rendering with routes');
  return (
    <Routes>
      <Route path="/" element={<WorkspaceManagementPage onWorkspaceUIChange={onWorkspaceUIChange} />} />
      <Route path="/workspace/:workspaceId" element={<WorkspaceSessionsPage onWorkspaceUIChange={onWorkspaceUIChange} />} />
      <Route path="/workspace/:workspaceId/session/:sessionId" element={<ChatSessionPage onWorkspaceUIChange={onWorkspaceUIChange} />} />
    </Routes>
  );
}
