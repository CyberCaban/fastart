import React, { useEffect, useState } from "react";
import { useOrderStore } from "../store/orderStore";
import OrderCard from "./OrderCard";
import { OrderStatus } from "../types";

const ONE_MIN = 60000;

const OrderList: React.FC = () => {
  const { getFilteredOrders, isLoading, error } = useOrderStore();
  const orders = getFilteredOrders();
  const [lastUpdateTime, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date())
    }, ONE_MIN)

    return () => {
      clearInterval(interval)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="order-list loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Загрузка заказов...</p>
        </div>
      </div>
    );
  }

  // if (error) {
  //   return (
  //     <div className="order-list error">
  //       <div className="error-message">
  //         <h3>Ошибка загрузки</h3>
  //         <p>{error}</p>
  //         <button
  //           className="btn-primary"
  //           onClick={() => window.location.reload()}
  //         >
  //           Перезагрузить страницу
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  if (orders.length === 0) {
    return (
      <div className="order-list empty">
        <div className="empty-message">
          <h3>Заказы не найдены</h3>
          <p>Попробуйте изменить фильтры или подождите новых заказов</p>
        </div>
      </div>
    );
  }

  // Group orders by status for better organization
  const groupedOrders = orders.reduce((acc, order) => {
    if (!acc[order.status]) {
      acc[order.status] = [];
    }
    acc[order.status].push(order);
    return acc;
  }, {} as Record<string, typeof orders>);

  // Sort orders within each group by creation time (newest first)
  Object.keys(groupedOrders).forEach((status) => {
    groupedOrders[status].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });

  // Define status order for display
  const statusOrder: OrderStatus[] = [
    "НОВЫЙ",
    "В РАБОТЕ",
    "ГОТОВО",
    "ВЫДАНО",
    "ОТМЕНЕНО",
  ];

  return (
    <div className="order-list">
      {statusOrder.map((status) => {
        const statusOrders = groupedOrders[status];
        if (!statusOrders || statusOrders.length === 0) return null;

        return (
          <div key={status} className="order-group">
            <div className="order-group__header">
              <h2 className="group-title">
                {status} ({statusOrders.length})
              </h2>
            </div>
            <div className="order-group__content">
              {statusOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderList;
