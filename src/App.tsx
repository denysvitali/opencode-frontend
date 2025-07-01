import { useEffect, useState, useCallback } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useUIStore } from './stores/uiStore.js';
import Layout from './components/layout/Layout.js';
import MainView from './components/layout/MainView.js';
import { NotificationContainer } from './components/ui/NotificationSystem.js';
import { useNotifications } from './hooks/useNotifications.js';

function App() {
  const { setIsMobile } = useUIStore();
  const { notifications, removeNotification } = useNotifications();
  const [showWorkspaceUI, setShowWorkspaceUI] = useState(false);
  
  // Initialize the app (loads conversations, sets up health checks)

  useEffect(() => {
    const checkMobile = () => {
      // More comprehensive mobile detection
      const isMobileWidth = window.innerWidth < 768;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerHeight < 600;
      
      setIsMobile(isMobileWidth || (isTouchDevice && isSmallScreen));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, [setIsMobile]);

  // Create a stable callback for workspace UI changes
  const handleWorkspaceUIChange = useCallback((show: boolean) => {
    console.log('App: Setting showWorkspaceUI to:', show);
    setShowWorkspaceUI(show);
  }, []);

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <div className="h-screen bg-gray-900 text-white overflow-hidden">
        <Layout showWorkspaceUI={showWorkspaceUI}>
          <MainView onWorkspaceUIChange={handleWorkspaceUIChange} />
        </Layout>
        
        {/* Global notification system */}
        <NotificationContainer 
          notifications={notifications} 
          onClose={removeNotification} 
        />
      </div>
    </Router>
  );
}

export default App;
