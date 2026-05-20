"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = initSocket;
exports.getIO = getIO;
exports.emitToFeed = emitToFeed;
const socket_io_1 = require("socket.io");
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
        console.log(`🔌 Client connected    — ${socket.id}`);
        socket.join("feed-room");
        socket.emit("joined", { room: "feed-room", socketId: socket.id });
        socket.on("disconnect", (reason) => {
            console.log(`🔌 Client disconnected — ${socket.id} (${reason})`);
        });
        socket.onAny((event) => {
            const internal = ["disconnect", "ping", "pong"];
            if (!internal.includes(event)) {
                console.warn(`⚠️  Unexpected event "${event}" received from ${socket.id} — ignoring`);
            }
        });
    });
    console.log("✅ Socket.IO initialised");
    return io;
}
function getIO() {
    if (!io) {
        throw new Error("Socket.IO not initialised — call initSocket(httpServer) in index.ts first");
    }
    return io;
}
function emitToFeed(event, data) {
    getIO().to("feed-room").emit(event, data);
}
