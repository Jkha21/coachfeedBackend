"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const feed_model_1 = __importDefault(require("../models/feed.model"));
const redis_1 = require("../config/redis");
const CACHE_TTL = 300; // 5 minutes
const CACHE_KEY = 'feeds:all';
class FeedService {
    constructor() {
        // Get all posts (with Redis caching)
        this.getAllPosts = () => __awaiter(this, void 0, void 0, function* () {
            const cachedFeeds = yield (0, redis_1.redisGet)(CACHE_KEY);
            if (cachedFeeds) {
                return JSON.parse(cachedFeeds);
            }
            const data = yield feed_model_1.default.find().sort({ createdAt: -1 }).limit(50);
            yield (0, redis_1.redisSet)(CACHE_KEY, JSON.stringify(data), CACHE_TTL);
            return data;
        });
        // Create new post (with Redis invalidation)
        this.createPost = (body) => __awaiter(this, void 0, void 0, function* () {
            const data = yield feed_model_1.default.create(body);
            yield (0, redis_1.redisDel)(CACHE_KEY);
            return data;
        });
    }
}
exports.default = FeedService;
