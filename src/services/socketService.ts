import { io, Socket } from "socket.io-client";
import type { Order, KitchenStats, SocketEvents, Dish, OrderStatus } from "../types";
import { useOrderStore } from "../store/orderStore";
import axios from "axios";

type Products = {
  id: number,
  title: string,
  quantity: number,
}

type NewOrder = {
  id: number,
  name: string,
  phone_number: string,
  address: string,
  city: string,
  created_at: string,
  paid_price: number,
  is_delivery: boolean,
  is_assembled?: boolean,
  products: Products[]
}

function processMessage(data: NewOrder[]): Order[] {
  function processStatus(is_assembled: boolean | null): OrderStatus {
    switch (is_assembled) {
      case true: return "ГОТОВО"
      case false: return "ОТМЕНЕНО"
      case null: return "НОВЫЙ"
    }
  }
  return data.map(o => {
    return {
      id: o.id.toString(),
      price: o.paid_price,
      orderNumber: o.id.toString(),
      isDelivery: o.is_delivery,
      status: processStatus(o.is_assembled ?? null),
      priority: "ОБЫЧНЫЙ",
      dishes: o.products.map(p => {
        return {
          id: p.id.toString(),
          price: 0,
          name: p.title,
          isReady: false,
          quantity: p.quantity
        } as Dish
      }),
      createdAt: o.created_at,
      updatedAt: o.created_at
    } as Order
  }) as Order[]
}

const ONE_SECOND = 1000;
class SocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 1000;
  private reconnectDelay = ONE_SECOND;
  private isConnecting = false;
  private shop_id = +import.meta.env.VITE_SHOP_ID;
  private password = import.meta.env.VITE_PASSWORD;
  private wsUrl: string | null = null;
  private adminUrl = import.meta.env.VITE_API_URL;

  connect(url: string): Promise<void> {
    this.wsUrl = url;
    return new Promise((resolve, reject) => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error("Connection already in progress"));
        return;
      }

      this.isConnecting = true;
      const store = useOrderStore.getState();

      try {
        this.socket = new WebSocket(url)

        this.socket.addEventListener("message", (ev) => {
          const data = JSON.parse(ev.data) as NewOrder[]
          const processed = processMessage(data)
          const localOrders = store.orders;

          for (const p of processed) {
            const old = localOrders.find((a) => a.id === p.id)
            if (old === undefined) store.addOrder(p)
          }

          this.playNotificationSound();
        })

        this.socket.addEventListener("open", () => {
          console.log("Connected to kitchen socket server");
          this.socket?.send(JSON.stringify({ shop_id: this.shop_id, password: this.password }));
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          store.setSocketConnected(true);
          store.setError(undefined);
          resolve();
        });

        this.socket.addEventListener("error", (error) => {
          console.error("Socket connection error:", error);
          this.isConnecting = false;
          store.setSocketConnected(false);
          store.setError(`Ошибка подключения: сокет не смог подключиться`);
          reject(error);
        });

        this.socket.addEventListener("close", (reason) => {
          console.log("Socket disconnected:", reason);
          store.setSocketConnected(false);

          this.handleReconnect();
        });
      } catch (error) {
        this.isConnecting = false;
        store.setError(`Ошибка инициализации сокета: ${error}`);
        reject(error);
      }
    });
  }

  private prepareUrl(url: URL, id: string) {
    const params = new URLSearchParams(url.search)
    params.set("id", id)
    url.search = params.toString()
  }

  private assembleOrderRequest(id: string) {
    const url = new URL(`${this.adminUrl}/assemble/${id}`)
    // this.prepareUrl(url, id)

    const passwordJson = JSON.stringify({ password: this.password })
    axios.put(url.toString(), passwordJson, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
  private kitchenOpenRequest(shop_id: string) {
    const url = new URL(`${this.adminUrl}/open/${shop_id}`)
    // this.prepareUrl(url, shop_id)
    const passwordJson = JSON.stringify({ password: this.password })
    axios.put(url.toString(), passwordJson)
  }
  private kitchenCloseRequest(shop_id: string) {
    const url = new URL(`${this.adminUrl}/close/${shop_id}`)
    // this.prepareUrl(url, shop_id)
    const passwordJson = JSON.stringify({ password: this.password })
    axios.put(url.toString(), passwordJson)
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached");
      useOrderStore
        .getState()
        .setError("Не удалось подключиться к серверу. Проверьте соединение.");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay; // Exponential backoff

    console.log(
      `Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`
    );

    setTimeout(() => {
      this.connect(this.wsUrl!).catch((e) => {
        console.error(`Reconnect failed: ${JSON.stringify(e)}`)
      });
    }, delay);
  }

  acceptOrder(orderId: string){
    if (this.socket?.readyState !== WebSocket.OPEN) {
      useOrderStore.getState().setError("Нет соединения с сервером");
      return;
    }

    useOrderStore.getState().acceptOrder(orderId);
  }

  markDishReady(orderId: string, dishId: string): void {
    if (!this.isConnected()) {
      useOrderStore.getState().setError("Нет соединения с сервером");
      return;
    }

    useOrderStore.getState().markDishReady(orderId, dishId);
  }

  markDishUnready(orderId: string, dishId: string): void {
    if (!this.isConnected()) {
      useOrderStore.getState().setError("Нет соединения с сервером");
      return;
    }

    useOrderStore.getState().markDishUnready(orderId, dishId);
  }

  async markOrderReady(orderId: string) {
    if (!this.isConnected()) {
      useOrderStore.getState().setError("Нет соединения с сервером");
      return;
    }

    try {
      axios.put(`${this.adminUrl}/assemble/${orderId}`, { password: this.password })
    } catch (e) {
      return e as Error
    }

    useOrderStore.getState().markOrderReady(orderId);
  }

  async issueOrder(orderId: string) {
    if (!this.isConnected()) {
      useOrderStore.getState().setError("Нет соединения с сервером");
      return;
    }

    // если самовывоз
    if (!useOrderStore.getState().getOrderById(orderId)?.isDelivery) {
      try {
        axios.put(`${this.adminUrl}/delivery/${orderId}`, { password: this.password })
      } catch (e) {
        return e as Error
      }
    }
    // this.assembleOrderRequest(orderId)
    useOrderStore.getState().issueOrder(orderId);
  }

  cancelOrder(orderId: string, reason?: string): void {
    if (!this.isConnected()) {
      useOrderStore.getState().setError("Нет соединения с сервером");
      return;
    }

    useOrderStore.getState().cancelOrder(orderId, reason);
  }

  stopKitchen(): void {
    if (!this.isConnected()) {
      useOrderStore.getState().setError("Нет соединения с сервером");
      return;
    }

    this.kitchenCloseRequest(this.shop_id.toString())
    useOrderStore.getState().stopKitchen();
  }

  openKitchen(): void {
    if (!this.isConnected()) {
      useOrderStore.getState().setError("Нет соединения с сервером");
      return;
    }

    this.kitchenOpenRequest(this.shop_id.toString())
    useOrderStore.getState().openKitchen();
  }

  private playNotificationSound(): void {
    try {
      const audioContext = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.warn("Could not play notification sound:", error);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      useOrderStore.getState().setSocketConnected(false);
    }
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN || false;
  }
}

export const socketService = new SocketService();
export default socketService;
