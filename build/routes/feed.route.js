"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const feed_controller_1 = __importDefault(require("../controllers/feed.controller"));
const feed_validator_1 = __importDefault(require("../validators/feed.validator"));
class FeedRoutes {
    constructor() {
        this.FeedController = new feed_controller_1.default();
        this.router = express_1.default.Router();
        this.FeedValidator = new feed_validator_1.default();
        this.routes = () => {
            // Route to fetch all posts for the feed
            this.router.get('', this.FeedController.getAllPosts);
            // Route to submit a new feed post (Validated before creation)
            this.router.post('', this.FeedValidator.newPost, this.FeedController.createPost);
        };
        this.getRoutes = () => {
            return this.router;
        };
        this.routes();
    }
}
exports.default = FeedRoutes;
