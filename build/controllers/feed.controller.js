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
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const feed_service_1 = __importDefault(require("../services/feed.service"));
class FeedController {
    constructor() {
        this.FeedService = new feed_service_1.default();
        /**
         * Controller to get all posts available
         * @param  {object} Request - request object
         * @param {object} Response - response object
         * @param {Function} NextFunction
         */
        this.getAllPosts = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield this.FeedService.getAllPosts();
                res.status(http_status_codes_1.default.OK).json({
                    code: http_status_codes_1.default.OK,
                    data: data,
                    message: 'All feeds fetched successfully'
                });
            }
            catch (error) {
                next(error);
            }
        });
        /**
         * Controller to create new feed post
         * @param  {object} Request - request object
         * @param {object} Response - response object
         * @param {Function} NextFunction
         */
        this.createPost = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield this.FeedService.createPost(req.body);
                res.status(http_status_codes_1.default.CREATED).json({
                    code: http_status_codes_1.default.CREATED,
                    data: data,
                    message: 'Feed created successfully'
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = FeedController;
