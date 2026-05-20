"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatFeedItem = void 0;
const logger_1 = __importDefault(require("../config/logger"));
const logger = logger_1.default.logger;
/**
 * Houses any miscellaneous client-facing formatting utilities or static
 * operational helpers needed for your feed controllers.
 */
const formatFeedItem = (item) => {
    return {
        id: item._id,
        title: item.title,
        content: item.content,
        author: item.author,
        timestamp: item.createdAt,
    };
};
exports.formatFeedItem = formatFeedItem;
