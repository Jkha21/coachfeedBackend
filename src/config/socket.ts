import { Server, type Socket } from "socket.io";
import type { Server as HTTPServer } from "http";
import mongoose from "mongoose";
import Logger from "./logger";

const logger = Logger.logger;
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
    socket.join("feed-room");
    socket.emit("joined", { room: "feed-room", socketId: socket.id });

    socket.onAny((event: string) => {
      const internal = ["disconnect", "ping", "pong"];
      if (!internal.includes(event)) {
        logger.warn(`Unexpected event "${event}" received from ${socket.id} — ignoring`);
      }
    });
  });

  logger.info("✅ Socket.IO initialised");
  return io;
}

export function getIO(): Server {
  if (!io) throw new Error("Socket.IO not initialised — call initSocket first");
  return io;
}

export function emitToFeed(event: string, data: unknown): void {
  getIO().to("feed-room").emit(event, data);
}

/**
 * Watches a Mongoose model collection and broadcasts updates to the socket room
 * @param modelName The case-sensitive registration string of the model (e.g., 'Feed')
 */
export function watchDatabaseChanges(modelName: string): void {
  try {
    const targetModel = mongoose.model(modelName);
    const changeStream = targetModel.watch([], { fullDocument: "updateLookup" });

    logger.info(`👁️  Database change stream actively watching: ${modelName}`);

    changeStream.on("change", (change) => {
      switch (change.operationType) {
        case "insert":
          emitToFeed("feed_created", change.fullDocument);
          break;
        case "update":
          emitToFeed("feed_updated", change.fullDocument);
          break;
        case "delete":
          emitToFeed("feed_deleted", { _id: change.documentKey?._id });
          break;
      }
    });

    changeStream.on("error", (error) => logger.error(`❌ Change Stream Error on ${modelName}:`, error));
  } catch (error) {
    logger.error(`❌ Failed to initialize change stream for model "${modelName}":`, error);
  }
}