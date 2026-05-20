import Feed from '../models/feed.model';
import Logger from '../config/logger';

const logger = Logger.logger;

/**
 * Houses any miscellaneous client-facing formatting utilities or static 
 * operational helpers needed for your feed controllers.
 */
export const formatFeedItem = (item: any) => {
  return {
    id: item._id,
    title: item.title,
    content: item.content,
    author: item.author,
    timestamp: item.createdAt,
  };
};