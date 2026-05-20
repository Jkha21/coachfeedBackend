import User from '../models/feed.model';
import { emitToFeed } from '../config/socket';
import Logger from '../config/logger';

const logger = Logger.logger;

export const watchFeedCollection = (): void => {
  const changeStream = User.watch([], { fullDocument: 'updateLookup' });

  logger.info('Database change stream initialized. Watching for changes...');

  changeStream.on('change', (change) => {
    try {
      if (change.operationType === 'insert') {
        emitToFeed('feed_created', change.fullDocument);
      }

      if (change.operationType === 'update') {
        // Now fullDocument will contain the completely updated object
        emitToFeed('feed_updated', change.fullDocument); 
      }

      if (change.operationType === 'delete') {
        emitToFeed('feed_deleted', { _id: change.documentKey._id });
      }
    } catch (error) {
      logger.error('Error handling database change stream event:', error);
    }
  });
};