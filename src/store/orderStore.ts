import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  Order,
  OrderStatus,
  OrderPriority,
  OrderFilters,
  KitchenStats,
  OrderStore,
} from "../types";

const initialStats: KitchenStats = {
  ordersToday: 0,
  completedToday: 0,
  pendingToday: 0,
  averagePreparationTime: 0,
  isKitchenOpen: true,
};

const initialFilters: OrderFilters = {
  status: ["НОВЫЙ", "В РАБОТЕ", "ГОТОВО"],
  priority: ["ОБЫЧНЫЙ", "СРОЧНЫЙ"],
};

export const useOrderStore = create<OrderStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      orders: [],
      stats: initialStats,
      filters: initialFilters,
      selectedOrderId: undefined,
      isLoading: false,
      error: undefined,
      socketConnected: false,

      // Basic setters
      setOrders: (orders) => set({ orders }),

      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders.filter((o) => o.id !== order.id)],
        })),

      updateOrder: (orderId, updates) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? { ...order, ...updates, updatedAt: new Date().toISOString() }
              : order
          ),
        })),

      removeOrder: (orderId) =>
        set((state) => ({
          orders: state.orders.filter((order) => order.id !== orderId),
        })),

      setStats: (stats) => set({ stats }),

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      setSelectedOrder: (orderId) => set({ selectedOrderId: orderId }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      setSocketConnected: (socketConnected) => set({ socketConnected }),

      // Computed getters
      getFilteredOrders: () => {
        const { orders, filters } = get();
        return orders.filter((order) => {
          // Filter by status
          if (filters.status && filters.status.length > 0) {
            if (!filters.status.includes(order.status)) return false;
          }

          // Filter by priority
          if (filters.priority && filters.priority.length > 0) {
            if (!filters.priority.includes(order.priority)) return false;
          }

          // Filter by table number
          if (
            filters.tableNumber &&
            order.tableNumber !== filters.tableNumber
          ) {
            return false;
          }

          // Filter by search query
          if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            const matchesOrderNumber = order.orderNumber
              .toLowerCase()
              .includes(query);
            const matchesTable = order.tableNumber.toString().includes(query);
            if (!matchesOrderNumber && !matchesTable) return false;
          }

          return true;
        });
      },

      getActiveOrders: () => {
        const { orders } = get();
        return orders.filter((order) =>
          ["НОВЫЙ", "В РАБОТЕ", "ГОТОВО"].includes(order.status)
        );
      },

      getHistoryOrders: () => {
        const { orders } = get();
        return orders.filter((order) =>
          ["ВЫДАНО", "ОТМЕНЕНО"].includes(order.status)
        );
      },

      getOrderById: (id) => {
        const { orders } = get();
        return orders.find((order) => order.id === id);
      },

      // Business logic actions
      acceptOrder: (orderId) => {
        const order = get().getOrderById(orderId);
        if (!order || order.status !== "НОВЫЙ") return;

        get().updateOrder(orderId, {
          status: "В РАБОТЕ",
          acceptedAt: new Date().toISOString(),
        });
      },

      markDishReady: (orderId, dishId) => {
        const order = get().getOrderById(orderId);
        if (!order || order.status !== "В РАБОТЕ") return;

        const updatedDishes = order.dishes.map((dish) =>
          dish.id === dishId ? { ...dish, isReady: true } : dish
        );

        get().updateOrder(orderId, { dishes: updatedDishes });
      },

      markDishUnready: (orderId, dishId) => {
        const order = get().getOrderById(orderId);
        console.log("markDishUnready", orderId, dishId, order);
        if (!order || order.status !== "В РАБОТЕ") return;

        const updatedDishes = order.dishes.map((dish) =>
          dish.id === dishId ? { ...dish, isReady: false } : dish
        );

        get().updateOrder(orderId, { dishes: updatedDishes });
      },

      markOrderReady: (orderId) => {
        const order = get().getOrderById(orderId);
        if (!order || order.status !== "В РАБОТЕ") return;

        // Check if all dishes are ready
        const allDishesReady = order.dishes.every((dish) => dish.isReady);
        if (!allDishesReady) return;

        const completedAt = new Date().toISOString();
        const acceptedAt = order.acceptedAt
          ? new Date(order.acceptedAt)
          : new Date();
        const actualTime = Math.round(
          (new Date(completedAt).getTime() - acceptedAt.getTime()) / (1000 * 60)
        );

        get().updateOrder(orderId, {
          status: "ГОТОВО",
          completedAt,
          actualTime,
        });
      },

      issueOrder: (orderId) => {
        const order = get().getOrderById(orderId);
        if (!order || order.status !== "ГОТОВО") return;

        get().updateOrder(orderId, {
          status: "ВЫДАНО",
          issuedAt: new Date().toISOString(),
        });
      },

      cancelOrder: (orderId, reason) => {
        const order = get().getOrderById(orderId);
        if (!order || ["ВЫДАНО", "ОТМЕНЕНО"].includes(order.status)) return;

        get().updateOrder(orderId, {
          status: "ОТМЕНЕНО",
          notes: reason ? `Отменен: ${reason}` : "Отменен",
        });
      },

      emergencyStop: () => {
        set((state) => ({
          stats: { ...state.stats, isKitchenOpen: false },
        }));
      },

      reopenKitchen: () => {
        set((state) => ({
          stats: { ...state.stats, isKitchenOpen: true },
        }));
      },
    }),
    {
      name: "kitchen-order-store",
    }
  )
);
