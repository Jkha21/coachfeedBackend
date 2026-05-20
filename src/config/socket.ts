import { Server, type Socket } from "socket.io";
import type { Server as HTTPServer } from "http";
import mongoose from "mongoose";

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

/**
 * Automatically watches a Mongoose model collection and broadcasts changes to the socket room
 * @param modelName The string name of the Mongoose model to watch (e.g., 'User' or 'Post')
 */
export function watchDatabaseChanges(modelName: string): void {
  try {
    const targetModel = mongoose.model(modelName);
    
    // updateLookup ensures the full updated document body is returned on updates
    const changeStream = targetModel.watch([], { fullDocument: "updateLookup" });

    console.log(`👁️  Database change stream watching collection: ${modelName}`);

    changeStream.on("change", (change) => {
      switch (change.operationType) {
        case "insert":
          emitToFeed("feed_created", change.fullDocument);
          break;
          
        case "update":
          emitToFeed("feed_updated", change.fullDocument);
          break;
          
        case "delete":
          emitToFeed("feed_deleted", { _id: change.documentKey._id });
          break;
          
        default:
          break;
      }
    });

    changeStream.on("error", (error) => {
      console.error(`❌ Change Stream Error on ${modelName}:`, error);
    });
  } catch (error) {
    console.error(`❌ Failed to initialize change stream for model "${modelName}":`, error);
  }
}