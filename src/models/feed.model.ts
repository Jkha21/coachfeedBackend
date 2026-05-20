import mongoose, { Schema, Model, models, model } from "mongoose";
import { IFeed } from "../interfaces/feed.interface";

const FeedSchema = new Schema<IFeed>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

FeedSchema.index({ createdAt: -1 });
FeedSchema.index({ author: 1, createdAt: -1 });

const FeedModel: Model<IFeed> = models.Feed || model<IFeed>("Feed", FeedSchema);

export default FeedModel;