"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openai = void 0;
const openai_1 = require("openai");
const configuration = new openai_1.Configuration({
    apiKey: "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",
});
exports.openai = new openai_1.OpenAIApi(configuration);
