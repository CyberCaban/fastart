import React from "react";
import { useOrderStore } from "../store/orderStore";
import { OrderStatus, OrderPriority } from "../types";

const OrderFilters: React.FC = () => {
  const { filters, setFilters, getFilteredOrders } = useOrderStore();

  const statusOptions: { value: OrderStatus; label: string; color: string }[] =
    [
      { value: "НОВЫЙ", label: "Новые", color: "var(--status-new)" },
      {
        value: "В РАБОТЕ",
        label: "В работе",
        color: "var(--status-in-progress)",
      },
      { value: "ГОТОВО", label: "Готово", color: "var(--status-ready)" },
      { value: "ВЫДАНО", label: "Выдано", color: "var(--status-issued)" },
      {
        value: "ОТМЕНЕНО",
        label: "Отменено",
        color: "var(--status-cancelled)",
      },
    ];

  const priorityOptions: { value: OrderPriority; label: string }[] = [
    { value: "ОБЫЧНЫЙ", label: "Обычный" },
    { value: "СРОЧНЫЙ", label: "Срочный" },
  ];

  const handleStatusToggle = (status: OrderStatus) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status];

    setFilters({ status: newStatuses });
  };

  const handlePriorityToggle = (priority: OrderPriority) => {
    const currentPriorities = filters.priority || [];
    const newPriorities = currentPriorities.includes(priority)
      ? currentPriorities.filter((p) => p !== priority)
      : [...currentPriorities, priority];

    setFilters({ priority: newPriorities });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ searchQuery: e.target.value });
  };

  const handleTableFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters({ tableNumber: value ? parseInt(value) : undefined });
  };

  const clearFilters = () => {
    setFilters({
      status: ["НОВЫЙ", "В РАБОТЕ", "ГОТОВО"],
      priority: ["ОБЫЧНЫЙ", "СРОЧНЫЙ"],
      searchQuery: undefined,
      tableNumber: undefined,
    });
  };

  const filteredCount = getFilteredOrders().length;

  return (
    <div className="order-filters">
      <div className="filters-row">
        <div className="search-section">
          <input
            type="text"
            placeholder="Поиск по столу или номеру заказа..."
            value={filters.searchQuery || ""}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>

        <div className="filters-section">
          <div className="filter-group">
            <label className="filter-label">Статус:</label>
            <div className="filter-buttons">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  className={`filter-btn ${(filters.status || []).includes(option.value)
                    ? "active"
                    : ""
                    }`}
                  onClick={() => handleStatusToggle(option.value)}
                  style={{
                    borderColor: (filters.status || []).includes(option.value)
                      ? option.color
                      : undefined,
                    backgroundColor: (filters.status || []).includes(
                      option.value
                    )
                      ? option.color
                      : undefined,
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">Приоритет:</label>
            <div className="filter-buttons">
              {priorityOptions.map((option) => (
                <button
                  key={option.value}
                  className={`filter-btn ${(filters.priority || []).includes(option.value)
                    ? "active"
                    : ""
                    }`}
                  onClick={() => handlePriorityToggle(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={clearFilters} className="btn-secondary filters-clear">
            Сбросить
          </button>
        </div>
      </div>

      <div className="filters-info">
        <span className="text-muted">
          Найдено заказов: <strong className="text-accent">{filteredCount}</strong>
        </span>
      </div>
    </div>
  );
};

export default OrderFilters;
