// sockets/server.ts
import { Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";

export function initSocketServer(server: HttpServer) {
  const io = new SocketServer(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Client connecté: ${socket.id}`);

    socket.on("join-room", (room: string) => {
      socket.join(room);
      console.log(`📦 Client ${socket.id} a rejoint la room ${room}`);
    });

    socket.on("leave-room", (room: string) => {
      socket.leave(room);
      console.log(`🚪 Client ${socket.id} a quitté la room ${room}`);
    });

    socket.on("send-message", (data: { room: string; message: any }) => {
      io.to(data.room).emit("receive-message", data.message);
    });

    socket.on("typing", (data: { room: string; user: string }) => {
      socket.to(data.room).emit("user-typing", data.user);
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Client déconnecté: ${socket.id}`);
    });
  });

  return io;
}
