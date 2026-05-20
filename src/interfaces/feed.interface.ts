// interfaces/IFeed.ts
import { Document } from "mongoose";

export interface IFeed extends Document {
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}