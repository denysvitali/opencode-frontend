import { useEffect, useRef } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useUIStore } from './stores/uiStore.js';
import { useAppStore } from './stores/appStore.js';
import Layout from './components/layout/Layout.js';
import MainView from './components/layout/MainView.js';
import { createMockData } from './utils/mockData.js';

function App() {
  const { setIsMobile } = useUIStore();
  const { conversations, setActiveConversation } = useAppStore();
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsMobile]);

  // Initialize with mock data if no conversations exist
  useEffect(() => {
    // Only initialize if we have no conversations and haven't initialized yet
    if (conversations.length === 0 && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      const mockConversations = createMockData();
      
      mockConversations.forEach(conv => {
        useAppStore.getState().addConversation(conv);
      });
      
      // Set the first conversation as active
      if (mockConversations.length > 0) {
        setActiveConversation(mockConversations[0].id);
      }
    }
  }, [conversations.length, setActiveConversation]);

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <div className="min-h-screen bg-gray-900 text-white">
        <Layout>
          <MainView />
        </Layout>
      </div>
    </Router>
  );
}

export default App;
