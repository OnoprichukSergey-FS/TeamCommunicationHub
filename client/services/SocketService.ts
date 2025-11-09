import { io, Socket } from "socket.io-client";

class SocketService {
  private static _instance: SocketService;
  private socket: Socket | null = null;

  static get instance() {
    if (!SocketService._instance) {
      SocketService._instance = new SocketService();
    }
    return SocketService._instance;
  }

  connect() {
    if (this.socket && this.socket.connected) {
      return;
    }

    this.socket = io("http://localhost:4000");

    this.socket.on("connect", () => {
      console.log("Connected to Socket.io:", this.socket?.id);
    });

    this.socket.on("disconnect", () => {
      console.log(" Disconnected from Socket.io");
    });
  }

  disconnect() {
    if (!this.socket) return;
    this.socket.disconnect();
    this.socket = null;
  }

  emit(event: string, payload?: any) {
    if (!this.socket) return;
    this.socket.emit(event, payload);
  }

  on(event: string, handler: (...args: any[]) => void) {
    if (!this.socket) return;
    this.socket.on(event, handler);
  }

  off(event: string, handler?: (...args: any[]) => void) {
    if (!this.socket) return;
    if (handler) {
      this.socket.off(event, handler);
    } else {
      this.socket.off(event);
    }
  }

  get isConnected() {
    return !!this.socket?.connected;
  }
}

export const socketService = SocketService.instance;
