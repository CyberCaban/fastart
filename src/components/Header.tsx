import React from "react";
import { useOrderStore } from "../store/orderStore";
import { socketService } from "../services/socketService";

const Header: React.FC = () => {
  const {
    stats,
    socketConnected,
    getActiveOrders,
  } = useOrderStore();

  const handleEmergencyStop = () => {
    if (stats.isKitchenOpen) {
      if (
        window.confirm("Вы уверены, что хотите экстренно остановить кухню?")
      ) {
        socketService.emergencyStop();
      }
    } else {
      if (window.confirm("Вы уверены, что хотите открыть кухню?")) {
        socketService.reopenKitchen();
      }
    }
  };

  const getStatusColor = () => {
    if (!socketConnected) return "var(--status-cancelled)";
    return stats.isKitchenOpen
      ? "var(--status-ready)"
      : "var(--status-cancelled)";
  };

  const getStatusText = () => {
    if (!socketConnected) return "Нет соединения";
    return stats.isKitchenOpen ? "Кухня открыта" : "Кухня закрыта";
  };

  const activeOrders = getActiveOrders();
  const newOrders = activeOrders.filter(
    (order) => order.status === "НОВЫЙ"
  ).length;
  const inProgressOrders = activeOrders.filter(
    (order) => order.status === "В РАБОТЕ"
  ).length;
  const readyOrders = activeOrders.filter(
    (order) => order.status === "ГОТОВО"
  ).length;
  const urgentOrders = activeOrders.filter(
    (order) => order.priority === "СРОЧНЫЙ"
  ).length;

  return (
    <header className="header">
      <div className="header__top">
        <div className="header__title">
          <h1 className="text-accent">Кухня - Управление заказами</h1>
          <div className="header__status">
            <div
              className="status-indicator"
              style={{ backgroundColor: getStatusColor() }}
            />
            <span className="text-muted">{getStatusText()}</span>
          </div>
        </div>

        <button
          className={`btn-danger ${!stats.isKitchenOpen ? "btn-primary" : ""}`}
          onClick={handleEmergencyStop}
          style={{ minWidth: "200px" }}
        >
          {stats.isKitchenOpen ? "▲ Экстренная остановка" : "▶ Открыть кухню"}
        </button>
      </div>

      <div className="header__stats">
        <div className="stats-section">
          <h3 className="stats-title">Статистика за день</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-value text-accent">
                  {stats.ordersToday}
                </div>
                <div className="stat-label">Заказов сегодня</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-value text-accent">
                  {stats.completedToday}
                </div>
                <div className="stat-label">Выполнено</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <div className="stat-value text-accent">
                  {stats.pendingToday}
                </div>
                <div className="stat-label">В ожидании</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏱️</div>
              <div className="stat-content">
                <div className="stat-value text-accent">
                  {stats.averagePreparationTime} мин
                </div>
                <div className="stat-label">Среднее время</div>
              </div>
            </div>
          </div>
        </div>

        <div className="active-stats-section">
          <h3 className="stats-title">Активные заказы</h3>
          <div className="active-stats-grid">
            <div className="active-stat">
              <span
                className="active-stat__value"
                style={{ color: "var(--status-new)" }}
              >
                {newOrders}
              </span>
              <span className="active-stat__label">Новые</span>
            </div>
            <div className="active-stat">
              <span
                className="active-stat__value"
                style={{ color: "var(--status-in-progress)" }}
              >
                {inProgressOrders}
              </span>
              <span className="active-stat__label">В работе</span>
            </div>
            <div className="active-stat">
              <span
                className="active-stat__value"
                style={{ color: "var(--status-ready)" }}
              >
                {readyOrders}
              </span>
              <span className="active-stat__label">Готово</span>
            </div>
            {urgentOrders > 0 && (
              <div className="active-stat urgent">
                <span
                  className="active-stat__value"
                  style={{ color: "var(--priority-urgent)" }}
                >
                  {urgentOrders}
                </span>
                <span className="active-stat__label">Срочные</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
