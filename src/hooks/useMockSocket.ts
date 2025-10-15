import { useEffect } from "react";
import { useOrderStore } from "../store/orderStore";
import { generateRandomOrder, mockStats } from "../data/mockData";

export const useMockSocket = () => {
  const { addOrder, setStats, socketConnected } = useOrderStore();

  useEffect(() => {
    // Only run in development mode and when socket is connected (mock mode)
    const isDev = import.meta.env.DEV;
    if (!isDev || !socketConnected) return;
    const TWO_MINUTES = 120000;

    // Simulate new orders every 30-60 seconds
    const newOrderInterval = setInterval(() => {
      const newOrder = generateRandomOrder();
      addOrder(newOrder);

      // Play notification sound
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

      // Show browser notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(`Новый заказ #${newOrder.orderNumber}`, {
          body: `Стол ${newOrder.isDelivery}`,
          icon: "/vite.svg",
          tag: "kitchen-order",
        });
      }
    }, Math.random() * 30000 + 30000); // 30-60 seconds

    // Simulate stats update every 2 minutes
    const statsInterval = setInterval(() => {
      const updatedStats = {
        ...mockStats,
        ordersToday: mockStats.ordersToday + Math.floor(Math.random() * 3),
        completedToday:
          mockStats.completedToday + Math.floor(Math.random() * 2),
        pendingToday: mockStats.ordersToday - mockStats.completedToday,
        averagePreparationTime: Math.floor(Math.random() * 10) + 15, // 15-25 minutes
      };
      setStats(updatedStats);
    }, TWO_MINUTES); // 2 minutes

    return () => {
      clearInterval(newOrderInterval);
      clearInterval(statsInterval);
    };
  }, [socketConnected, addOrder, setStats]);
};
