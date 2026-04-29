import { io, Socket } from "socket.io-client";

const SOCKET_URL = "https://teamcommunicationhub.onrender.com";

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket) return;

    this.socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      console.log("[Socket] Connected:", this.socket?.id);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.log("[Socket] Connection error:", error.message);
    });
  }

  get isConnected() {
    return !!this.socket?.connected;
  }

  emit(event: string, payload?: any) {
    if (!this.socket) this.connect();
    this.socket?.emit(event, payload);
  }

  on(event: string, handler: (...args: any[]) => void) {
    if (!this.socket) this.connect();
    this.socket?.on(event, handler);
  }

  off(event: string, handler: (...args: any[]) => void) {
    this.socket?.off(event, handler);
  }
}

export const socketService = new SocketService();
