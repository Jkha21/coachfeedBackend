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

import { initSocket, watchDatabaseChanges } from './config/socket';
import { disconnectRedis } from './config/redis';

import './models/feed.model';

class App {
  public app: Application;
  public httpServer: HTTPServer;
  public port: string | number;
  public host: string;
  public api_version: string;
  
  private db = new Database();
  private logger = Logger.logger;
  public errorHandler = new ErrorHandler();

  constructor() {
    this.app = express();
    this.httpServer = createServer(this.app);

    this.host = (process.env.APP_HOST || 'localhost')
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '');

    this.port = process.env.PORT || process.env.APP_PORT || 5000;
    this.api_version = process.env.API_VERSION || 'v1';

    this.initializeMiddleWares();
    this.initializeRoutes();
    this.initializeSockets();
    this.initializeErrorHandlers();
    this.initializeGracefulShutdown();
    
    this.boot();
  }

  private initializeMiddleWares(): void {
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true
    }));
    this.app.use(helmet());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
    this.app.use(morgan('combined', { stream: Logger.logStream }));
  }

  private initializeSockets(): void {
    initSocket(this.httpServer);
  }

  private initializeRoutes(): void {
    this.app.use(`/api/${this.api_version}`, routes());
  }

  private initializeErrorHandlers(): void {
    this.app.use(this.errorHandler.appErrorHandler);
    this.app.use(this.errorHandler.genericErrorHandler);
    this.app.use(this.errorHandler.notFound);
  }

  private async boot(): Promise<void> {
    try {
      await this.db.initializeDatabase();
      
      watchDatabaseChanges('Feed');
      
      this.httpServer.listen(Number(this.port), this.host, () => {
        this.logger.info(`🚀 App running at http://${this.host}:${this.port}/api/${this.api_version}/`);
      });
    } catch (error) {
      this.logger.error('💥 Critical boot error encountered:', error);
      process.exit(1);
    }
  }

  private initializeGracefulShutdown(): void {
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
}

export default new App();