import dotenv from 'dotenv';
dotenv.config();

import express, { Application } from 'express';
import { createServer, Server as HTTPServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';

import routes from './routes';
import Database from './config/database';
import ErrorHandler from './middlewares/error.middleware';
import Logger from './config/logger';

import { initSocket } from './config/socket';
import { disconnectRedis } from './config/redis';

class App {
  public app: Application;
  public httpServer: HTTPServer;
  public host: string | number;
  public port: string | number;
  public api_version: string | number;
  private db = new Database();
  private logStream = Logger.logStream;
  private logger = Logger.logger;
  public errorHandler = new ErrorHandler();

  constructor() {
    this.app = express();
    this.httpServer = createServer(this.app);

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

  public initializeMiddleWares(): void {
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3001',
      credentials: true
    }));
    this.app.use(helmet());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
    this.app.use(morgan('combined', { stream: this.logStream }));
  }

  public initializeDatabase(): void {
    this.db.initializeDatabase();
  }

  public initializeSockets(): void {
    initSocket(this.httpServer);
    this.logger.info('🔌 WebSockets initialized successfully');
  }

  public initializeRoutes(): void {
    this.app.use(`/api/${this.api_version}`, routes());
  }

  public initializeErrorHandlers(): void {
    this.app.use(this.errorHandler.appErrorHandler);
    this.app.use(this.errorHandler.genericErrorHandler);
    this.app.use(this.errorHandler.notFound);
  }

  public initializeGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      this.logger.info(`\nℹ️  ${signal} received — shutting down gracefully…`);

      this.httpServer.close(async () => {
        try {
          await disconnectRedis();
          await mongoose.disconnect();
          this.logger.info("✅ Clean shutdown complete");
          process.exit(0);
        } catch (err) {
          this.logger.error("❌ Error during shutdown:", err);
          process.exit(1);
        }
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  }

  public startApp(): void {
    this.httpServer.listen(this.port, () => {
      this.logger.info(
        `Server started running at ${this.host}:${this.port}/api/${this.api_version}/`
      );
    });
  }

  public getApp(): Application {
    return this.app;
  }
}

const app = new App();

export default app;