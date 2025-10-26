import { useCallback, useEffect, useMemo, useState } from "react";
import { useOrderStore } from "./store/orderStore";
import { socketService } from "./services/socketService";
import Header from "./components/Header";
import OrderFilters from "./components/OrderFilters";
import OrderList from "./components/OrderList";
import "./components/KitchenApp.css";
import CredentialsDialog from "./components/dialogs/CredentialsDialog";

function App() {
  const { setOrders, setStats, setLoading, setError, setSocketConnected, password, shop_id, setCredentials } =
    useOrderStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        setIsInitialized(true);
        if (password === null || shop_id === null) throw Error("Идентификатор и/или пароль от магазина не задан")
        try {
          const url = !import.meta.env.DEV ? "ws://localhost:8080" : "wss://shaurma-jan.ru/v1/admin/active_assembly_orders";
          socketService.setCredentials(shop_id, password)
          await socketService.connect(url);
          console.log("Connected to real socket server");
        } catch (error) {
          console.log("Failed to connect to socketService");
        }
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize app:", error);
        setError(`Ошибка инициализации приложения: ${error}`);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();

    return () => {
      socketService.disconnect();
    };
  }, [setOrders, setStats, setLoading, setError, setSocketConnected, password, shop_id]);

  const handleSubmit = useCallback((data: { shopId: string; password: string }) => {
    console.log(data);
    setCredentials(+data.shopId, data.password)
  }, [])
  const isDialogOpen = useMemo(() => !password || !shop_id, [password, shop_id])

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
      <CredentialsDialog onClose={() => { }} isOpen={isDialogOpen} onSubmit={handleSubmit} preventEscExit={false} />
    </div>
  );
}

export default App;
