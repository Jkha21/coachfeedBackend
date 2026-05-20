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
exports.userAuth = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Middleware to authenticate if user has a valid Authorization token
 * Authorization: Bearer <token>
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
const userAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let bearerToken = req.header('Authorization');
        if (!bearerToken)
            throw {
                code: http_status_codes_1.default.BAD_REQUEST,
                message: 'Authorization token is required'
            };
        bearerToken = bearerToken.split(' ')[1];
        const { user } = yield jsonwebtoken_1.default.verify(bearerToken, 'your-secret-key');
        res.locals.user = user;
        res.locals.token = bearerToken;
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.userAuth = userAuth;
