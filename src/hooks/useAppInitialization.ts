import { useEffect, useRef } from 'react';
import { useAppStore } from '../stores/appStore.js';
import { createMockData } from '../utils/mockData.js';

/**
 * Hook to initialize the app with data
 * Loads conversations on app start and sets up health checking
 */
export function useAppInitialization() {
  const { 
    conversations,
    loadConversationsFromAPI, 
    addConversation, 
    checkHealthAPI,
    setLoading,
    clearError 
  } = useAppStore();

  const hasInitialized = useRef(false);

  useEffect(() => {
    const initializeApp = async () => {
      // Prevent multiple initializations
      if (hasInitialized.current) return;
      hasInitialized.current = true;

      try {
        setLoading(true);
        clearError();

        // Check API health first
        await checkHealthAPI();

        if (__DEMO_MODE__) {
          // In demo mode, use existing mock data logic but ensure no duplicates
          if (conversations.length === 0) {
            const mockConversations = createMockData();
            mockConversations.forEach(conversation => {
              addConversation(conversation);
            });
          }
        } else {
          // In real mode, load from API
          await loadConversationsFromAPI();
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
        // Fallback to mock data on error
        if (conversations.length === 0) {
          const mockConversations = createMockData();
          mockConversations.forEach(conversation => {
            addConversation(conversation);
          });
        }
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, [
    conversations.length,
    loadConversationsFromAPI,
    addConversation,
    checkHealthAPI,
    setLoading,
    clearError
  ]);

  // Set up periodic health checks
  useEffect(() => {
    const healthCheckInterval = setInterval(() => {
      checkHealthAPI();
    }, 30000);

    return () => {
      clearInterval(healthCheckInterval);
    };
  }, [checkHealthAPI]);

  return {
    // Could return initialization status if needed
  };
}
