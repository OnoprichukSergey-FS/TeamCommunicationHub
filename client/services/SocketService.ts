import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket) return;

    this.socket = io("http://localhost:4000", {
      transports: ["websocket"],
    });

    this.socket.on("connect", () => {
      console.log("[Socket] Connected:", this.socket?.id);
    });

    this.socket.on("disconnect", () => {
      console.log("[Socket] Disconnected");
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
