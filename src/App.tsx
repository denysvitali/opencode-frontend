import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useUIStore } from './stores/uiStore.js';
import Layout from './components/layout/Layout.js';
import MainView from './components/layout/MainView.js';
import { useAppInitialization } from './hooks/useAppInitialization.js';

function App() {
  const { setIsMobile } = useUIStore();
  
  // Initialize the app (loads conversations, sets up health checks)
  useAppInitialization();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsMobile]);

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
