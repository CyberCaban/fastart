import { Dish, Order } from "../types";

export default function DishRow({
  dish,
  order,
  handleDishToggle,
}: {
  dish: Dish;
  order: Order;
  handleDishToggle: (dishId: string, isReady: boolean) => void;
}) {
  return (
    <div key={dish.id} className={`dish-item ${dish.isReady ? "ready" : ""}`}>
      <div className="dish-info">
        <span className="dish-name">{dish.name}</span>
        <span className="dish-quantity">Количество: {dish.quantity}</span>
      </div>
      {order.status === "В РАБОТЕ" && (
        <label className="dish-checkbox">
          <input
            type="checkbox"
            checked={dish.isReady}
            onChange={(e) => {
              handleDishToggle(dish.id, e.target.checked);
            }}
          />
          <span className="checkmark">✓</span>
        </label>
      )}
      {order.status !== "В РАБОТЕ" && dish.isReady && (
        <div className="dish-ready">✓</div>
      )}
    </div>
  );
}
