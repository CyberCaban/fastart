import { useEffect, useState } from 'react';
import { useOrderStore } from './store/orderStore';
import { socketService } from './services/socketService';
import { mockOrders, mockStats } from './data/mockData';
import { useMockSocket } from './hooks/useMockSocket';
import Header from './components/Header';
import OrderFilters from './components/OrderFilters';
import OrderList from './components/OrderList';
import StatsPanel from './components/StatsPanel';
import './components/KitchenApp.css';

function App() {
  const { setOrders, setStats, setLoading, setError, setSocketConnected } = useOrderStore();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Use mock socket for development
  useMockSocket();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        
        // Request notification permission
        await socketService.requestNotificationPermission();
        
        // Check if we're in development mode or if real server is available
        const isDev = import.meta.env.DEV;
        const useMockMode = isDev; // Always use mock in development
        
        if (useMockMode) {
          console.log('Development mode: Using mock data');
          setSocketConnected(false);
          
          // Load mock data for development
          setOrders(mockOrders);
          setStats(mockStats);
          
          // Simulate socket connection for testing
          setTimeout(() => {
            console.log('Mock socket connection established');
            setSocketConnected(true);
          }, 500);
        } else {
          // Try to connect to real socket server in production
          try {
            await socketService.connect('ws://localhost:3001');
            console.log('Connected to real socket server');
          } catch (error) {
            console.warn('Could not connect to socket server, falling back to mock data:', error);
            setSocketConnected(false);
            
            // Load mock data as fallback
            setOrders(mockOrders);
            setStats(mockStats);
            
            setTimeout(() => {
              console.log('Fallback mock socket connection established');
              setSocketConnected(true);
            }, 500);
          }
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setError('Ошибка инициализации приложения');
      } finally {
        setLoading(false);
      }
    };

    initializeApp();

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, [setOrders, setStats, setLoading, setError, setSocketConnected]);

  if (!isInitialized) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <h2>Загрузка системы управления кухней...</h2>
          <p>Подключение к серверу заказов</p>
        </div>
      </div>
    );
  }

  return (
    <div className="kitchen-app">
      <Header />
      
      <div className="app-content">
        <div className="app-sidebar">
          <StatsPanel />
        </div>
        
        <div className="app-main">
          <OrderFilters />
          <OrderList />
        </div>
      </div>
    </div>
  );
}

export default App;
