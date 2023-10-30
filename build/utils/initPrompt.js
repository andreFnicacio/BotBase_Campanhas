"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initPrompt = void 0;
const pizzaAgent_1 = require("../prompts/pizzaAgent");
function initPrompt(storeName, orderCode) {
    return pizzaAgent_1.prompt
        .replace(/{{[\s]?storeName[\s]?}}/g, storeName)
        .replace(/{{[\s]?orderCode[\s]?}}/g, orderCode);
}
exports.initPrompt = initPrompt;
