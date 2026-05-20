"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const mongoose_1 = __importDefault(require("mongoose"));
const routes_1 = __importDefault(require("./routes"));
const database_1 = __importDefault(require("./config/database"));
const error_middleware_1 = __importDefault(require("./middlewares/error.middleware"));
const logger_1 = __importDefault(require("./config/logger"));
const socket_1 = require("./config/socket");
const redis_1 = require("./config/redis");
class App {
    constructor() {
        this.db = new database_1.default();
        this.logStream = logger_1.default.logStream;
        this.logger = logger_1.default.logger;
        this.errorHandler = new error_middleware_1.default();
        this.app = (0, express_1.default)();
        this.httpServer = (0, http_1.createServer)(this.app);
        this.host = process.env.APP_HOST || 'localhost';
        this.port = process.env.PORT || process.env.APP_PORT || 5000;
        this.api_version = process.env.API_VERSION || 'v1';
        this.initializeMiddleWares();
        this.initializeRoutes();
        this.initializeDatabase();
        this.initializeSockets();
        this.initializeErrorHandlers();
        this.initializeGracefulShutdown();
        this.startApp();
    }
    initializeMiddleWares() {
        this.app.use((0, cors_1.default)({
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true
        }));
        this.app.use((0, helmet_1.default)());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.use(express_1.default.json());
        this.app.use((0, morgan_1.default)('combined', { stream: this.logStream }));
    }
    initializeDatabase() {
        this.db.initializeDatabase();
    }
    initializeSockets() {
        (0, socket_1.initSocket)(this.httpServer);
        this.logger.info('🔌 WebSockets initialized successfully');
    }
    initializeRoutes() {
        this.app.use(`/api/${this.api_version}`, (0, routes_1.default)());
    }
    initializeErrorHandlers() {
        this.app.use(this.errorHandler.appErrorHandler);
        this.app.use(this.errorHandler.genericErrorHandler);
        this.app.use(this.errorHandler.notFound);
    }
    initializeGracefulShutdown() {
        const shutdown = (signal) => __awaiter(this, void 0, void 0, function* () {
            this.logger.info(`\nℹ️  ${signal} received — shutting down gracefully…`);
            this.httpServer.close(() => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield (0, redis_1.disconnectRedis)();
                    yield mongoose_1.default.disconnect();
                    this.logger.info("✅ Clean shutdown complete");
                    process.exit(0);
                }
                catch (err) {
                    this.logger.error("❌ Error during shutdown:", err);
                    process.exit(1);
                }
            }));
        });
        process.on("SIGTERM", () => shutdown("SIGTERM"));
        process.on("SIGINT", () => shutdown("SIGINT"));
    }
    startApp() {
        this.httpServer.listen(this.port, () => {
            this.logger.info(`Server started running at http://${this.host}:${this.port}/api/${this.api_version}/`);
        });
    }
    getApp() {
        return this.app;
    }
}
const app = new App();
exports.default = app;
