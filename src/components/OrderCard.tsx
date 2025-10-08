import React from "react";
import {Order, OrderStatus} from "../types";
import {useOrderStore} from "../store/orderStore";
import {socketService} from "../services/socketService";
import DishRow from "./DishRow";

interface OrderCardProps {
    order: Order;
}

const OrderCard: React.FC<OrderCardProps> = ({order}) => {
    const {updateOrder} = useOrderStore();

    const getStatusColor = (status: OrderStatus): string => {
        switch (status) {
            case "НОВЫЙ":
                return "var(--status-new)";
            case "В РАБОТЕ":
                return "var(--status-in-progress)";
            case "ГОТОВО":
                return "var(--status-ready)";
            case "ВЫДАНО":
                return "var(--status-issued)";
            case "ОТМЕНЕНО":
                return "var(--status-cancelled)";
            default:
                return "var(--text-muted)";
        }
    };

    const getStatusClass = (status: OrderStatus): string => {
        return `status-${status.toLowerCase().replace(" ", "-")}`;
    };

    const formatTime = (dateString: string): string => {
        return new Date(dateString).toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getElapsedTime = (): string => {
        const now = new Date();
        const created = new Date(order.createdAt);
        const elapsed = Math.floor(
            (now.getTime() - created.getTime()) / (1000 * 60)
        );

        if (elapsed < 60) {
            return `${elapsed} мин`;
        } else {
            const hours = Math.floor(elapsed / 60);
            const minutes = elapsed % 60;
            return `${hours}ч ${minutes}м`;
        }
    };

    const getPreparationTime = (): string => {
        if (order.actualTime) {
            return `${order.actualTime} мин`;
        }
        if (order.acceptedAt) {
            const now = new Date();
            const accepted = new Date(order.acceptedAt);
            const elapsed = Math.floor(
                (now.getTime() - accepted.getTime()) / (1000 * 60)
            );
            return `${elapsed} мин`;
        }
        return getElapsedTime();
    };

    const handleAcceptOrder = () => {
        socketService.acceptOrder(order.id);
    };

    const handleDishToggle = (dishId: string, isReady: boolean) => {
        if (!isReady) {
            socketService.markDishUnready(order.id, dishId);
        } else {
            socketService.markDishReady(order.id, dishId);
        }
    };

    const handleMarkReady = () => {
        socketService.markOrderReady(order.id);
    };

    const handleIssueOrder = () => {
        socketService.issueOrder(order.id);
    };

    const handleCancelOrder = () => {
        const reason = window.prompt("Причина отмены заказа:");
        if (reason !== null) {
            socketService.cancelOrder(order.id, reason);
        }
    };

    const canAccept = order.status === "НОВЫЙ";
    const canMarkReady =
        order.status === "В РАБОТЕ" && order.dishes.every((dish) => dish.isReady);
    const canIssue = order.status === "ГОТОВО";
    const canCancel = ["НОВЫЙ", "В РАБОТЕ", "ГОТОВО"].includes(order.status);

    const allDishesReady = order.dishes.every((dish) => dish.isReady);
    const formatPrice = (price: number) => {
        const formatter = new Intl.NumberFormat("ru-RU", {style: "currency", currency: "RUB"})
        return formatter.format(price);
    }
    return (
        <div
            className={`order-card ${order.priority === "СРОЧНЫЙ" ? "urgent" : ""}`}
        >
            <div className="order-card__header">
                <div className="order-info">
                    <h3 className="order-number">Заказ #{order.orderNumber}</h3>
                    <div className="order-meta">
                        <span className="table-info">Стол {order.tableNumber}</span>
                        <span className="time-info">
              • Создан {formatTime(order.createdAt)}
            </span>
                        {order.acceptedAt && (
                            <span className="time-info">
                • Принят {formatTime(order.acceptedAt)}
              </span>
                        )}
                    </div>
                </div>

                <div className="order-status">
                    <div
                        className={`status-badge ${getStatusClass(order.status)}`}
                        style={{backgroundColor: getStatusColor(order.status)}}
                    >
                        {order.status}
                    </div>
                    {order.priority === "СРОЧНЫЙ" && (
                        <div className="priority-badge priority-urgent">СРОЧНО</div>
                    )}
                </div>
            </div>

            <div className="order-card__content">
                <div className="dishes-section">
                    <h4 className="dishes-title">Блюда:</h4>
                    <div className="dishes-list">
                        {order.dishes.map((dish) => (
                            <DishRow
                                key={dish.id}
                                dish={dish}
                                order={order}
                                handleDishToggle={handleDishToggle}
                            />
                        ))}
                    </div>
                </div>

                <div className="order-price">
                    Итог: {formatPrice(order.price)}
                </div>

                <div className="order-timing">
                    <div className="timing-item">
                        <span className="timing-label">Время ожидания:</span>
                        <span className="timing-value">{getElapsedTime()}</span>
                    </div>
                    {order.status === "В РАБОТЕ" && (
                        <div className="timing-item">
                            <span className="timing-label">Время приготовления:</span>
                            <span className="timing-value">{getPreparationTime()}</span>
                        </div>
                    )}
                    {order.estimatedTime && (
                        <div className="timing-item">
                            <span className="timing-label">Ожидаемое время:</span>
                            <span className="timing-value">{order.estimatedTime} мин</span>
                        </div>
                    )}
                </div>

                {order.notes && (
                    <div className="order-notes">
                        <span className="notes-label">Примечания:</span>
                        <span className="notes-text">{order.notes}</span>
                    </div>
                )}
            </div>

            <div className="order-card__actions">
                {canAccept && (
                    <button className="btn-primary" onClick={handleAcceptOrder}>
                        Принять в работу
                    </button>
                )}

                {canMarkReady && (
                    <button className="btn-primary" onClick={handleMarkReady}>
                        Готово к выдаче
                    </button>
                )}

                {canIssue && (
                    <button className="btn-primary" onClick={handleIssueOrder}>
                        Выдать заказ
                    </button>
                )}

                {canCancel && (
                    <button className="btn-danger" onClick={handleCancelOrder}>
                        Отменить
                    </button>
                )}

                {order.status === "В РАБОТЕ" && !allDishesReady && (
                    <div className="progress-info">
            <span className="text-muted">
              Готово блюд: {order.dishes.filter((d) => d.isReady).length} из {order.dishes.length}
            </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderCard;
