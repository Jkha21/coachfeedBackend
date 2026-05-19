import { Server, type Socket } from "socket.io";
import type { Server as HTTPServer } from "http";

const CLIENT_URL = process.env.FRONTEND_URL || "http://localhost:3000";

let io: Server | null = null;

export function initSocket(httpServer: HTTPServer): Server {
  if (io) return io;

  io = new Server(httpServer, {
    cors: {
      origin: CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 20_000,
    pingInterval: 25_000,
  });

  io.on("connection", (socket: Socket) => {
    console.log(`🔌 Client connected    — ${socket.id}`);

    socket.join("feed-room");

    socket.emit("joined", { room: "feed-room", socketId: socket.id });

    socket.on("disconnect", (reason: string) => {
      console.log(`🔌 Client disconnected — ${socket.id} (${reason})`);
    });

    socket.onAny((event: string) => {
      const internal = ["disconnect", "ping", "pong"];
      if (!internal.includes(event)) {
        console.warn(
          `⚠️  Unexpected event "${event}" received from ${socket.id} — ignoring`
        );
      }
    });
  });

  console.log("✅ Socket.IO initialised");
  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error(
      "Socket.IO not initialised — call initSocket(httpServer) in index.ts first"
    );
  }
  return io;
}

export function emitToFeed(event: string, data: unknown): void {
  getIO().to("feed-room").emit(event, data);
}