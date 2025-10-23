import { useEffect, useState } from "react";
import { useOrderStore } from "./store/orderStore";
import { socketService } from "./services/socketService";
import { mockOrders, mockStats } from "./data/mockData";
import { useMockSocket } from "./hooks/useMockSocket";
import Header from "./components/Header";
import OrderFilters from "./components/OrderFilters";
import OrderList from "./components/OrderList";
import "./components/KitchenApp.css";

function App() {
  const { setOrders, setStats, setLoading, setError, setSocketConnected } =
    useOrderStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        try {
          const url = !import.meta.env.DEV ? "ws://localhost:8080" : "wss://shaurma-jan.ru/v1/admin/active_assembly_orders";
          await socketService.connect(url);
          console.log("Connected to real socket server");
        } catch (error) {
          console.log("Failed to connect to socketService");
        }
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize app:", error);
        setError("Ошибка инициализации приложения");
      } finally {
        setLoading(false);
      }
    };

    initializeApp();

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
        <OrderFilters />
        <OrderList />
      </div>
    </div>
  );
}

export default App;
