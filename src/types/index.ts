// Типы для системы управления заказами кухни

export type OrderStatus = 'НОВЫЙ' | 'В РАБОТЕ' | 'ГОТОВО' | 'ВЫДАНО' | 'ОТМЕНЕНО';

export type OrderPriority = 'ОБЫЧНЫЙ' | 'СРОЧНЫЙ';

export interface Dish {
  id: string;
  name: string;
  quantity: number;
  isReady: boolean;
  preparationTime?: number; // в минутах
  category?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  tableNumber: number;
  status: OrderStatus;
  priority: OrderPriority;
  dishes: Dish[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  acceptedAt?: string; // когда принят в работу
  completedAt?: string; // когда готов
  issuedAt?: string; // когда выдан
  estimatedTime?: number; // ожидаемое время приготовления в минутах
  actualTime?: number; // фактическое время приготовления в минутах
  notes?: string;
}

export interface KitchenStats {
  ordersToday: number;
  completedToday: number;
  pendingToday: number;
  averagePreparationTime: number; // в минутах
  isKitchenOpen: boolean;
}

export interface SocketEvents {
  // События от сервера
  'order:new': (order: Order) => void;
  'order:updated': (order: Order) => void;
  'order:deleted': (orderId: string) => void;
  'stats:updated': (stats: KitchenStats) => void;
  'kitchen:status': (isOpen: boolean) => void;
  'error': (error: { message: string; code?: string }) => void;
  
  // События к серверу
  'order:accept': (orderId: string) => void;
  'order:ready': (orderId: string) => void;
  'order:issue': (orderId: string) => void;
  'order:cancel': (orderId: string, reason?: string) => void;
  'order:dish:ready': (orderId: string, dishId: string) => void;
  'order:dish:unready': (orderId: string, dishId: string) => void;
  'kitchen:emergency_stop': () => void;
  'kitchen:reopen': () => void;
}

export interface OrderFilters {
  status?: OrderStatus[];
  priority?: OrderPriority[];
  tableNumber?: number;
  searchQuery?: string;
}

export interface AppState {
  orders: Order[];
  stats: KitchenStats;
  filters: OrderFilters;
  selectedOrderId?: string;
  isLoading: boolean;
  error?: string;
  socketConnected: boolean;
}

export interface OrderStore extends AppState {
  // Actions
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  removeOrder: (orderId: string) => void;
  setStats: (stats: KitchenStats) => void;
  setFilters: (filters: Partial<OrderFilters>) => void;
  setSelectedOrder: (orderId?: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
  setSocketConnected: (connected: boolean) => void;
  
  // Computed
  getFilteredOrders: () => Order[];
  getActiveOrders: () => Order[];
  getHistoryOrders: () => Order[];
  getOrderById: (id: string) => Order | undefined;
  
  // Actions
  acceptOrder: (orderId: string) => void;
  markDishReady: (orderId: string, dishId: string) => void;
  markDishUnready: (orderId: string, dishId: string) => void;
  markOrderReady: (orderId: string) => void;
  issueOrder: (orderId: string) => void;
  cancelOrder: (orderId: string, reason?: string) => void;
  emergencyStop: () => void;
  reopenKitchen: () => void;
}
