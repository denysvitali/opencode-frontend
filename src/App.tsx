import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useUIStore } from './stores/uiStore.js';
import { useAppStore } from './stores/appStore.js';
import Layout from './components/layout/Layout.js';
import ChatView from './components/chat/ChatView.js';
import { createMockData } from './utils/mockData.js';

function App() {
  const { setIsMobile } = useUIStore();
  const { conversations, setActiveConversation } = useAppStore();

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
    if (conversations.length === 0) {
      const mockConversations = createMockData();
      const store = useAppStore.getState();
      
      mockConversations.forEach(conv => {
        store.addConversation(conv);
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
          <Routes>
            <Route path="/" element={<ChatView />} />
            <Route path="/conversation/:id" element={<ChatView />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;
