import React from 'react';
import { useOrderStore } from '../store/orderStore';
import { socketService } from '../services/socketService';

const Header: React.FC = () => {
  const { stats, socketConnected, emergencyStop, reopenKitchen } = useOrderStore();

  const handleEmergencyStop = () => {
    if (stats.isKitchenOpen) {
      if (window.confirm('Вы уверены, что хотите экстренно остановить кухню?')) {
        socketService.emergencyStop();
      }
    } else {
      if (window.confirm('Вы уверены, что хотите открыть кухню?')) {
        socketService.reopenKitchen();
      }
    }
  };

  const getStatusColor = () => {
    if (!socketConnected) return 'var(--status-cancelled)';
    return stats.isKitchenOpen ? 'var(--status-ready)' : 'var(--status-cancelled)';
  };

  const getStatusText = () => {
    if (!socketConnected) return 'Нет соединения';
    return stats.isKitchenOpen ? 'Кухня открыта' : 'Кухня закрыта';
  };

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
        
        <div className="header__stats">
          <div className="stat-item">
            <span className="stat-label">Заказы сегодня:</span>
            <span className="stat-value text-accent">{stats.ordersToday}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Выполнено:</span>
            <span className="stat-value text-accent">{stats.completedToday}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">В ожидании:</span>
            <span className="stat-value text-accent">{stats.pendingToday}</span>
          </div>
        </div>

        <button
          className={`btn-danger ${!stats.isKitchenOpen ? 'btn-primary' : ''}`}
          onClick={handleEmergencyStop}
          style={{ minWidth: '200px' }}
        >
          {stats.isKitchenOpen ? '▲ Экстренная остановка' : '▶ Открыть кухню'}
        </button>
      </div>
    </header>
  );
};

export default Header;
