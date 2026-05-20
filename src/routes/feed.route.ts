import express, { IRouter } from 'express';
import FeedController from '../controllers/feed.controller';
import FeedValidator from '../validators/feed.validator';

class FeedRoutes {
  private FeedController = new FeedController();
  private router = express.Router();
  private FeedValidator = new FeedValidator();

  constructor() {
    this.routes();
  }

  private routes = () => {
    // Route to fetch all posts for the feed
    this.router.get('', this.FeedController.getAllPosts);

    // Route to submit a new feed post (Validated before creation)
    this.router.post(
      '',
      this.FeedValidator.newPost,
      this.FeedController.createPost
    );
  };

  public getRoutes = (): IRouter => {
    return this.router;
  };
}

export default FeedRoutes;