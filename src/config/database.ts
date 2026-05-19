import mongoose from 'mongoose';
import Logger from './logger';

class Database {
  private DATABASE: string;
  private logger;

  constructor() {
    this.DATABASE = process.env.NODE_ENV === 'test'
      ? (process.env.DATABASE_TEST || '')
      : (process.env.DATABASE || process.env.MONGODB_URI || '');

    this.logger = Logger.logger;
  }

  public initializeDatabase = async (): Promise<void> => {
    if (mongoose.connection.readyState === 1) {
      this.logger.info('Using existing MongoDB connection.');
      return;
    }

    if (!this.DATABASE) {
      this.logger.error('Missing connection string. Add DATABASE or MONGODB_URI to environment variables.');
      throw new Error('Database connection string is missing.');
    }

    try {
      await mongoose.connect(this.DATABASE, {
        bufferCommands: false
      });
      this.logger.info('Connected to the database successfully.');
    } catch (error) {
      this.logger.error('Could not connect to the database.', error);
      throw error;
    }
  };
}

export default Database;