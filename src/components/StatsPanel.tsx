import React from "react";
import { useOrderStore } from "../store/orderStore";

const StatsPanel: React.FC = () => {
  const { stats, getActiveOrders, getHistoryOrders } = useOrderStore();

  const activeOrders = getActiveOrders();
  const historyOrders = getHistoryOrders();

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

  // Calculate average preparation time from completed orders
  const completedOrders = historyOrders.filter(
    (order) => order.status === "ВЫДАНО" && order.actualTime
  );
  const avgPrepTime =
    completedOrders.length > 0
      ? Math.round(
          completedOrders.reduce(
            (sum, order) => sum + (order.actualTime || 0),
            0
          ) / completedOrders.length
        )
      : stats.averagePreparationTime;

  return (
    <div className="stats-panel">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value text-accent">{stats.ordersToday}</div>
            <div className="stat-label">Заказов сегодня</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value text-accent">{stats.completedToday}</div>
            <div className="stat-label">Выполнено</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-value text-accent">{stats.pendingToday}</div>
            <div className="stat-label">В ожидании</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-value text-accent">{avgPrepTime} мин</div>
            <div className="stat-label">Среднее время</div>
          </div>
        </div>
      </div>

      <div className="active-stats">
        <h3 className="active-stats__title">Активные заказы</h3>
        <div className="active-stats__grid">
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

      <div className="kitchen-status">
        <div className="status-indicator">
          <div
            className="status-dot"
            style={{
              backgroundColor: stats.isKitchenOpen
                ? "var(--status-ready)"
                : "var(--status-cancelled)",
            }}
          />
          <span className="status-text">
            {stats.isKitchenOpen ? "Кухня работает" : "Кухня остановлена"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
