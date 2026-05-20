"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = initSocket;
exports.getIO = getIO;
exports.emitToFeed = emitToFeed;
exports.watchDatabaseChanges = watchDatabaseChanges;
const socket_io_1 = require("socket.io");
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("./logger"));
const logger = logger_1.default.logger;
const CLIENT_URL = process.env.FRONTEND_URL || "http://localhost:3000";
let io = null;
function initSocket(httpServer) {
    if (io)
        return io;
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: CLIENT_URL,
            methods: ["GET", "POST"],
            credentials: true,
        },
        pingTimeout: 20000,
        pingInterval: 25000,
    });
    io.on("connection", (socket) => {
        socket.join("feed-room");
        socket.emit("joined", { room: "feed-room", socketId: socket.id });
        socket.onAny((event) => {
            const internal = ["disconnect", "ping", "pong"];
            if (!internal.includes(event)) {
                logger.warn(`Unexpected event "${event}" received from ${socket.id} — ignoring`);
            }
        });
    });
    logger.info("✅ Socket.IO initialised");
    return io;
}
function getIO() {
    if (!io)
        throw new Error("Socket.IO not initialised — call initSocket first");
    return io;
}
function emitToFeed(event, data) {
    getIO().to("feed-room").emit(event, data);
}
/**
 * Watches a Mongoose model collection and broadcasts updates to the socket room
 * @param modelName The case-sensitive registration string of the model (e.g., 'Feed')
 */
function watchDatabaseChanges(modelName) {
    try {
        const targetModel = mongoose_1.default.model(modelName);
        const changeStream = targetModel.watch([], { fullDocument: "updateLookup" });
        logger.info(`👁️  Database change stream actively watching: ${modelName}`);
        changeStream.on("change", (change) => {
            var _a;
            switch (change.operationType) {
                case "insert":
                    emitToFeed("feed_created", change.fullDocument);
                    break;
                case "update":
                    emitToFeed("feed_updated", change.fullDocument);
                    break;
                case "delete":
                    emitToFeed("feed_deleted", { _id: (_a = change.documentKey) === null || _a === void 0 ? void 0 : _a._id });
                    break;
            }
        });
        changeStream.on("error", (error) => logger.error(`❌ Change Stream Error on ${modelName}:`, error));
    }
    catch (error) {
        logger.error(`❌ Failed to initialize change stream for model "${modelName}":`, error);
    }
}
