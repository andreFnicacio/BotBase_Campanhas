"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const ioredis_1 = require("ioredis");
const config_1 = require("../config");
exports.redis = new ioredis_1.Redis({
    host: config_1.config.redis.host,
    port: config_1.config.redis.port,
    db: config_1.config.redis.db,
});
