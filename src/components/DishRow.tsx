import {Dish, Order} from "../types";

export default function DishRow({
                                    dish,
                                    order,
                                    handleDishToggle,
                                }: {
    dish: Dish;
    order: Order;
    handleDishToggle: (dishId: string, isReady: boolean) => void;
}) {
    if (order.status === "В РАБОТЕ") return (
        <label className={`dish-item ${dish.isReady ? "ready" : ""}`}>
            <div className="dish-info">
                <span className="dish-name">{dish.name}</span>
                <span className="dish-quantity">Количество: {dish.quantity}</span>
            </div>
            <input
                type="checkbox"
                checked={dish.isReady}
                onChange={(e) => {
                    handleDishToggle(dish.id, e.target.checked);
                }}
            />
            <span className={`${dish.isReady ? "dish-ready" : 'checkmark'}`}>{dish.isReady ? "✓" : " "}</span>
        </label>
    );

    return (
        <div key={dish.id} className={`dish-item ${dish.isReady ? "ready" : ""}`}>
            <div className="dish-info">
                <span className="dish-name">{dish.name}</span>
                <span className="dish-quantity">Количество: {dish.quantity}</span>
            </div>
        </div>
    );
}
