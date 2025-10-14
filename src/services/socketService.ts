import { io, Socket } from "socket.io-client";
import type { Order, KitchenStats, SocketEvents } from "../types";
import { useOrderStore } from "../store/orderStore";
import axios from "axios";

const ONE_SECOND = 1000;
class SocketService {
  private socket: Socket<SocketEvents> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = ONE_SECOND;
  private isConnecting = false;
  private shop_id = import.meta.env.VITE_SHOP_ID;
  private password = import.meta.env.VITE_PASSWORD;
  private url: string | null = null;

  connect(url: string = "ws://localhost:3001"): Promise<void> {
    this.url = url;
    return new Promise((resolve, reject) => {
      const isDev = import.meta.env.DEV;
      if (isDev) {
        reject(new Error("Development mode: skipping real socket connection"));
        return;
      }

      if (this.socket?.connected) {
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
        this.socket = io(url, {
          transports: ["websocket"],
          timeout: 10000,
          forceNew: true,
        });

        this.setupEventListeners();

        this.socket.on("connect", () => {
          console.log("Connected to kitchen socket server");
          this.socket?.send({ shop_id: this.shop_id, password: this.password });
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          store.setSocketConnected(true);
          store.setError(undefined);
          resolve();
        });

        this.socket.on("connect_error", (error) => {
          console.error("Socket connection error:", error);
          this.isConnecting = false;
          store.setSocketConnected(false);
          store.setError(`Ошибка подключения: ${error.message}`);
          reject(error);
        });

        this.socket.on("disconnect", (reason) => {
          console.log("Socket disconnected:", reason);
          store.setSocketConnected(false);

          if (reason === "io server disconnect") {
            this.handleReconnect();
          }
        });
      } catch (error) {
        this.isConnecting = false;
        store.setError(`Ошибка инициализации сокета: ${error}`);
        reject(error);
      }
    });
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    const store = useOrderStore.getState();

    this.socket.on("message", (message: string) => {
      // Заказы которые нужно приготовить
      console.log("Message received:", message);
    });

    this.socket.on("order:new", (order: Order) => {
      console.log("New order received:", order);
      store.addOrder(order);

      this.playNotificationSound();

      this.showBrowserNotification(
        `Новый заказ #${order.orderNumber}`,
        `Стол ${order.tableNumber}`
      );
    });

    this.socket.on("order:updated", (order: Order) => {
      console.log("Order updated:", order);
      store.updateOrder(order.id, order);
    });

    this.socket.on("order:deleted", (orderId: string) => {
      console.log("Order deleted:", orderId);
      store.removeOrder(orderId);
    });

    this.socket.on("stats:updated", (stats: KitchenStats) => {
      console.log("Stats updated:", stats);
      store.setStats(stats);
    });

    this.socket.on("kitchen:status", (isOpen: boolean) => {
      console.log("Kitchen status:", isOpen);
      store.setStats({ ...store.stats, isKitchenOpen: isOpen });
    });

    this.socket.on("error", (error: { message: string; code?: string }) => {
      console.error("Socket error:", error);
      store.setError(`Ошибка сервера: ${error.message}`);
    });
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
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

    console.log(
      `Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`
    );

    setTimeout(() => {
      this.connect().catch(() => {
      });
    }, delay);
  }

  acceptOrder(orderId: string): void {
    const isDev = import.meta.env.DEV;

    if (!isDev && !this.socket?.connected) {
      useOrderStore.getState().setError("Нет соединения с сервером");
      return;
    }

    if (!isDev) {
      this.socket?.emit("order:accept", orderId);
    }
    axios.put(`${this.url}/assemble/${orderId}`, { password: this.password });
    useOrderStore.getState().acceptOrder(orderId);
  }

  markDishReady(orderId: string, dishId: string): void {
    const isDev = import.meta.env.DEV;

    if (!isDev && !this.socket?.connected) {
      useOrderStore.getState().setError("Нет соединения с сервером");
      return;
    }

    if (!isDev) {
      this.socket?.emit("order:dish:ready", orderId, dishId);
    }
    useOrderStore.getState().markDishReady(orderId, dishId);
  }

  markDishUnready(orderId: string, dishId: string): void {
    const isDev = import.meta.env.DEV;

    if (!isDev && !this.socket?.connected) {
      useOrderStore.getState().setError("Нет соединения с сервером");
      return;
    }

    if (!isDev) {
      this.socket?.emit("order:dish:unready", orderId, dishId);
    }
    useOrderStore.getState().markDishUnready(orderId, dishId);
  }

  markOrderReady(orderId: string): void {
    const isDev = import.meta.env.DEV;

    if (!isDev && !this.socket?.connected) {
      useOrderStore.getState().setError("Нет соединения с сервером");
      return;
    }

    if (!isDev) {
      this.socket?.emit("order:ready", orderId);
    }
    useOrderStore.getState().markOrderReady(orderId);
  }

  issueOrder(orderId: string): void {
    const isDev = import.meta.env.DEV;

    if (!isDev && !this.socket?.connected) {
      useOrderStore.getState().setError("Нет соединения с сервером");
      return;
    }

    if (!isDev) {
      this.socket?.emit("order:issue", orderId);
    }
    useOrderStore.getState().issueOrder(orderId);
  }

  cancelOrder(orderId: string, reason?: string): void {
    const isDev = import.meta.env.DEV;

    if (!isDev && !this.socket?.connected) {
      useOrderStore.getState().setError("Нет соединения с сервером");
      return;
    }

    if (!isDev) {
      this.socket?.emit("order:cancel", orderId, reason);
    }
    useOrderStore.getState().cancelOrder(orderId, reason);
  }

  emergencyStop(): void {
    const isDev = import.meta.env.DEV;

    if (!isDev && !this.socket?.connected) {
      useOrderStore.getState().setError("Нет соединения с сервером");
      return;
    }

    if (!isDev) {
      this.socket?.emit("kitchen:emergency_stop");
    }
    useOrderStore.getState().emergencyStop();
  }

  reopenKitchen(): void {
    const isDev = import.meta.env.DEV;

    if (!isDev && !this.socket?.connected) {
      useOrderStore.getState().setError("Нет соединения с сервером");
      return;
    }

    if (!isDev) {
      this.socket?.emit("kitchen:reopen");
    }
    useOrderStore.getState().reopenKitchen();
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

  private showBrowserNotification(title: string, body: string): void {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/vite.svg",
        tag: "kitchen-order",
      });
    }
  }

  async requestNotificationPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      useOrderStore.getState().setSocketConnected(false);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
export default socketService;
