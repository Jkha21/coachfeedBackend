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
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisGet = redisGet;
exports.redisSet = redisSet;
exports.redisDel = redisDel;
exports.disconnectRedis = disconnectRedis;
const redis_1 = require("redis");
let client = null;
function getRedisClient() {
    return __awaiter(this, void 0, void 0, function* () {
        if (client)
            return client;
        const redisUrl = process.env.REDIS_URL;
        if (redisUrl) {
            client = (0, redis_1.createClient)({ url: redisUrl });
        }
        else {
            client = (0, redis_1.createClient)({
                username: process.env.REDIS_USERNAME,
                password: process.env.REDIS_PASSWORD,
                socket: {
                    host: process.env.REDIS_HOST,
                    port: parseInt(process.env.REDIS_PORT || "6379"),
                    reconnectStrategy: (retries) => {
                        if (retries > 10) {
                            console.error("❌ Redis: max reconnection attempts reached");
                            return new Error("Redis max retries exceeded");
                        }
                        const delay = Math.min(retries * 200, 10000);
                        console.warn(`⚠️  Redis: reconnecting in ${delay}ms (attempt ${retries})`);
                        return delay;
                    },
                },
            });
        }
        client.on("error", (err) => console.error("❌ Redis error:", err.message));
        client.on("connect", () => console.log("✅ Redis connected"));
        client.on("reconnecting", () => console.warn("⚠️  Redis reconnecting…"));
        client.on("end", () => console.log("ℹ️  Redis connection closed"));
        yield client.connect();
        return client;
    });
}
function redisGet(key) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const c = yield getRedisClient();
            return yield c.get(key);
        }
        catch (err) {
            console.error(`❌ Redis GET "${key}" failed:`, err);
            return null;
        }
    });
}
function redisSet(key_1, value_1) {
    return __awaiter(this, arguments, void 0, function* (key, value, ttlSeconds = 30) {
        try {
            const item = yield getRedisClient();
            yield item.set(key, value, { EX: ttlSeconds });
        }
        catch (err) {
            console.error(`❌ Redis SET "${key}" failed:`, err);
        }
    });
}
function redisDel(key) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const item = yield getRedisClient();
            yield item.del(key);
        }
        catch (err) {
            console.error(`❌ Redis DEL "${key}" failed:`, err);
        }
    });
}
function disconnectRedis() {
    return __awaiter(this, void 0, void 0, function* () {
        if (client) {
            yield client.quit();
            client = null;
            console.log("ℹ️  Redis disconnected");
        }
    });
}
