import Feed from '../models/feed.model';
import { IFeed } from '../interfaces/feed.interface';
import { redisGet, redisSet, redisDel } from '../config/redis';

const CACHE_TTL = 300; // 5 minutes
const CACHE_KEY = 'feeds:all';

class FeedService {
  // Get all posts (with Redis caching)
  public getAllPosts = async (): Promise<IFeed[]> => {
    const cachedFeeds = await redisGet(CACHE_KEY);

    if (cachedFeeds) {
      return JSON.parse(cachedFeeds);
    }

    const data = await Feed.find().sort({ createdAt: -1 }).limit(50);
    
    await redisSet(CACHE_KEY, JSON.stringify(data), CACHE_TTL);
    return data;
  };

  // Create new post (with Redis invalidation)
  public createPost = async (body: IFeed): Promise<IFeed> => {
    const data = await Feed.create(body);
    await redisDel(CACHE_KEY);
    return data;
  };
}

export default FeedService;