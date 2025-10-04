import { Order, KitchenStats, Dish } from '../types';

// Mock dishes data
export const mockDishes: Dish[] = [
  { id: '1', name: 'Борщ украинский', quantity: 2, isReady: false, preparationTime: 25, category: 'Супы' },
  { id: '2', name: 'Котлета по-киевски', quantity: 1, isReady: false, preparationTime: 30, category: 'Горячие блюда' },
  { id: '3', name: 'Салат Цезарь', quantity: 1, isReady: false, preparationTime: 15, category: 'Салаты' },
  { id: '4', name: 'Стейк Рибай', quantity: 1, isReady: false, preparationTime: 20, category: 'Горячие блюда' },
  { id: '5', name: 'Картофель фри', quantity: 1, isReady: false, preparationTime: 10, category: 'Гарниры' },
  { id: '6', name: 'Сырный соус', quantity: 1, isReady: false, preparationTime: 5, category: 'Соусы' },
  { id: '7', name: 'Лазанья мясная', quantity: 1, isReady: false, preparationTime: 35, category: 'Паста' },
  { id: '8', name: 'Греческий салат', quantity: 1, isReady: false, preparationTime: 12, category: 'Салаты' },
  { id: '9', name: 'Чесночный хлеб', quantity: 4, isReady: false, preparationTime: 8, category: 'Хлеб' },
  { id: '10', name: 'Пицца Маргарита', quantity: 2, isReady: false, preparationTime: 25, category: 'Пицца' },
  { id: '11', name: 'Паста Карбонара', quantity: 2, isReady: false, preparationTime: 18, category: 'Паста' },
];

// Mock orders data
export const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: '1001',
    tableNumber: 5,
    status: 'НОВЫЙ',
    priority: 'ОБЫЧНЫЙ',
    dishes: [
      { id: '1', name: 'Борщ украинский', quantity: 2, isReady: false, preparationTime: 25 },
      { id: '2', name: 'Котлета по-киевски', quantity: 1, isReady: false, preparationTime: 30 },
      { id: '3', name: 'Салат Цезарь', quantity: 1, isReady: false, preparationTime: 15 },
    ],
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    estimatedTime: 30,
  },
  {
    id: '2',
    orderNumber: '1002',
    tableNumber: 12,
    status: 'В РАБОТЕ',
    priority: 'СРОЧНЫЙ',
    dishes: [
      { id: '4', name: 'Стейк Рибай', quantity: 1, isReady: true, preparationTime: 20 },
      { id: '5', name: 'Картофель фри', quantity: 1, isReady: false, preparationTime: 10 },
      { id: '6', name: 'Сырный соус', quantity: 1, isReady: true, preparationTime: 5 },
    ],
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
    acceptedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
    estimatedTime: 20,
  },
  {
    id: '3',
    orderNumber: '1003',
    tableNumber: 7,
    status: 'ГОТОВО',
    priority: 'ОБЫЧНЫЙ',
    dishes: [
      { id: '7', name: 'Лазанья мясная', quantity: 1, isReady: true, preparationTime: 35 },
      { id: '8', name: 'Греческий салат', quantity: 1, isReady: true, preparationTime: 12 },
      { id: '9', name: 'Чесночный хлеб', quantity: 4, isReady: true, preparationTime: 8 },
    ],
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
    updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
    acceptedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(), // 40 minutes ago
    completedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
    estimatedTime: 35,
    actualTime: 38,
  },
  {
    id: '4',
    orderNumber: '1004',
    tableNumber: 3,
    status: 'ВЫДАНО',
    priority: 'ОБЫЧНЫЙ',
    dishes: [
      { id: '10', name: 'Пицца Маргарита', quantity: 2, isReady: true, preparationTime: 25 },
    ],
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    acceptedAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(), // 55 minutes ago
    completedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(), // 35 minutes ago
    issuedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    estimatedTime: 25,
    actualTime: 20,
  },
  {
    id: '5',
    orderNumber: '1005',
    tableNumber: 8,
    status: 'ОТМЕНЕНО',
    priority: 'ОБЫЧНЫЙ',
    dishes: [
      { id: '11', name: 'Паста Карбонара', quantity: 2, isReady: false, preparationTime: 18 },
    ],
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(), // 1.5 hours ago
    updatedAt: new Date(Date.now() - 80 * 60 * 1000).toISOString(), // 80 minutes ago
    acceptedAt: new Date(Date.now() - 85 * 60 * 1000).toISOString(), // 85 minutes ago
    estimatedTime: 18,
    notes: 'Отменен: клиент ушел',
  },
];

// Mock kitchen stats
export const mockStats: KitchenStats = {
  ordersToday: 108,
  completedToday: 46,
  pendingToday: 62,
  averagePreparationTime: 18,
  isKitchenOpen: true,
};

// Function to generate random new order
export const generateRandomOrder = (): Order => {
  const orderNumbers = ['1006', '1007', '1008', '1009', '1010'];
  const tableNumbers = [1, 2, 4, 6, 9, 10, 11, 13, 14, 15];
  const priorities: ('ОБЫЧНЫЙ' | 'СРОЧНЫЙ')[] = ['ОБЫЧНЫЙ', 'СРОЧНЫЙ'];
  
  const randomDishes = mockDishes
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.floor(Math.random() * 4) + 1) // 1-4 dishes
    .map(dish => ({
      ...dish,
      id: `${dish.id}_${Date.now()}`,
      isReady: false,
    }));

  const priority = priorities[Math.floor(Math.random() * priorities.length)];
  const tableNumber = tableNumbers[Math.floor(Math.random() * tableNumbers.length)];
  const orderNumber = orderNumbers[Math.floor(Math.random() * orderNumbers.length)];

  return {
    id: `order_${Date.now()}`,
    orderNumber,
    tableNumber,
    status: 'НОВЫЙ',
    priority,
    dishes: randomDishes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    estimatedTime: Math.max(...randomDishes.map(d => d.preparationTime || 0)),
  };
};

// Function to simulate socket events
export const simulateSocketEvents = () => {
  // Simulate new order every 30-60 seconds
  setInterval(() => {
    const newOrder = generateRandomOrder();
    // This would be called by the socket service
    console.log('Simulating new order:', newOrder);
  }, Math.random() * 30000 + 30000); // 30-60 seconds

  // Simulate stats update every 2 minutes
  setInterval(() => {
    const updatedStats: KitchenStats = {
      ...mockStats,
      ordersToday: mockStats.ordersToday + Math.floor(Math.random() * 3),
      completedToday: mockStats.completedToday + Math.floor(Math.random() * 2),
      pendingToday: mockStats.ordersToday - mockStats.completedToday,
      averagePreparationTime: Math.floor(Math.random() * 10) + 15, // 15-25 minutes
    };
    console.log('Simulating stats update:', updatedStats);
  }, 120000); // 2 minutes
};

// Function to get orders by status
export const getOrdersByStatus = (status: string): Order[] => {
  return mockOrders.filter(order => order.status === status);
};

// Function to get active orders (not completed or cancelled)
export const getActiveOrders = (): Order[] => {
  return mockOrders.filter(order => 
    ['НОВЫЙ', 'В РАБОТЕ', 'ГОТОВО'].includes(order.status)
  );
};

// Function to get history orders (completed or cancelled)
export const getHistoryOrders = (): Order[] => {
  return mockOrders.filter(order => 
    ['ВЫДАНО', 'ОТМЕНЕНО'].includes(order.status)
  );
};
