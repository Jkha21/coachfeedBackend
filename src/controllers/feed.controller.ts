/* eslint-disable @typescript-eslint/no-explicit-any */
import HttpStatus from 'http-status-codes';
import FeedService from '../services/feed.service';

import { Request, Response, NextFunction } from 'express';

class FeedController {
  public FeedService = new FeedService();

  /**
   * Controller to get all posts available
   * @param  {object} Request - request object
   * @param {object} Response - response object
   * @param {Function} NextFunction
   */
  public getAllPosts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      const data = await this.FeedService.getAllPosts();
      res.status(HttpStatus.OK).json({
        code: HttpStatus.OK,
        data: data,
        message: 'All feeds fetched successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Controller to create new feed post
   * @param  {object} Request - request object
   * @param {object} Response - response object
   * @param {Function} NextFunction
   */
  public createPost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      const data = await this.FeedService.createPost(req.body);
      res.status(HttpStatus.CREATED).json({
        code: HttpStatus.CREATED,
        data: data,
        message: 'Feed created successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}

export default FeedController;