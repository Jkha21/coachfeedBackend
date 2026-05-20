"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const FeedSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
}, {
    timestamps: true,
});
FeedSchema.index({ createdAt: -1 });
FeedSchema.index({ author: 1, createdAt: -1 });
const FeedModel = mongoose_1.models.Feed || (0, mongoose_1.model)("Feed", FeedSchema);
exports.default = FeedModel;
