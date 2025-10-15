import WebSocket, { WebSocketServer } from 'ws';

type Products = {
  id: number;
  title: string;
  quantity: number;
};

type NewOrder = {
  id: number;
  name: string;
  phone_number: string;
  address: string;
  city: string;
  created_at: string;
  paid_price: number;
  is_delivery: boolean;
  is_assembled?: boolean;
  products: Products[];
};

const exampleOrders: NewOrder[] = [
  {
    id: 123,
    name: 'Иван Иванов',
    phone_number: '+7 999 123 45 67',
    address: 'ул. Пушкина, д. 10',
    city: 'Москва',
    created_at: new Date().toUTCString(),
    paid_price: 4500,
    is_delivery: true,
    is_assembled: false,
    products: [
      { id: 1, title: 'Товар 1', quantity: 2 },
      { id: 2, title: 'Товар 2', quantity: 1 },
    ],
  },
  {
    id: 124,
    name: 'Мария Петрова',
    phone_number: '+7 901 234 56 78',
    address: 'пр. Ленина, д. 5',
    city: 'Санкт-Петербург',
    created_at: new Date().toUTCString(),
    paid_price: 7200,
    is_delivery: false,
    is_assembled: true,
    products: [
      { id: 3, title: 'Товар 3', quantity: 1 },
      { id: 4, title: 'Товар 4', quantity: 3 },
    ],
  },
  {
    id: 154,
    name: 'Алексей Смирнов',
    phone_number: '+7 912 345 67 89',
    address: 'ул. Советская, д. 15, кв. 7',
    city: 'Новосибирск',
    created_at: new Date().toUTCString(),
    paid_price: 1500,
    is_delivery: true,
    products: [
      { id: 5, title: 'Товар 5', quantity: 1 },
    ],
  },
];

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Клиент подключился');

  ws.send(JSON.stringify(exampleOrders.slice(0, 1)));
  setTimeout(() => {
    ws.send(JSON.stringify(exampleOrders.slice()))
  }, 2000)

  ws.on('message', (message) => {
    console.log('Получено сообщение от клиента:', message.toString());
  });

  ws.on('close', () => {
    console.log('Клиент отключился');
  });
});

console.log('WebSocket сервер запущен на ws://localhost:8080');
