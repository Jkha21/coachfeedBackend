import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

class FeedValidator {
  public newPost = (req: Request, res: Response, next: NextFunction): void => {
    const schema = Joi.object({
      title: Joi.string()
        .min(3)
        .max(100)
        .trim()
        .required()
        .messages({
          "string.base":  "Title must be a string",
          "string.empty": "Title is required",
          "string.min":   "Title must be at least 3 characters long",
          "string.max":   "Title cannot exceed 100 characters",
          "any.required": "Title is required",
        }),

      content: Joi.string()
        .min(10)
        .max(300)
        .trim()
        .required()
        .custom((value: string, helpers) => {
          if (value.trim().length === 0) {
            return helpers.error("string.empty");
          }
          return value.trim();
        }, "Content whitespace guard")
        .messages({
          "string.base":  "Content must be a string",
          "string.empty": "Content cannot be empty or whitespace only",
          "string.min":   "Content must be at least 10 characters long",
          "string.max":   "Content cannot exceed 300 characters",
          "any.required": "Content is required",
        }),

      author: Joi.string()
        .min(2)
        .max(50)
        .trim()
        .required()
        .messages({
          "string.base":  "Author name must be a string",
          "string.empty": "Author name is required",
          "string.min":   "Author name must be at least 2 characters long",
          "string.max":   "Author name cannot exceed 50 characters",
          "any.required": "Author name is required",
        }),
    });

    const { error, value } = schema.validate(req.body, {
      abortEarly:   false,
      stripUnknown: true,
    });

    if (error) {
      return next(error);
    }

    req.body = value;
    next();
  };

  public validateId = (req: Request, res: Response, next: NextFunction): void => {
    const schema = Joi.string()
      .trim()
      .required()
      .custom((value: string, helpers) => {
        if (!mongoose.isValidObjectId(value)) {
          return helpers.error("any.invalid");
        }
        return value;
      }, "MongoDB ObjectId format check")
      .messages({
        "string.base":  "Post ID must be a string",
        "string.empty": "Post ID is required",
        "any.invalid":  "Invalid post ID format — must be a valid MongoDB ObjectId",
        "any.required": "Post ID is required",
      });

    const { error } = schema.validate(req.params.id);

    if (error) {
      return next(error);
    }

    next();
  };
}

export default FeedValidator;