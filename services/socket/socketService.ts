// services/socket/socketService.ts
import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", {
      auth: { token },
    });
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export const socketService = new SocketService();
