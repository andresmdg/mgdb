"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mgdb = void 0;
var database_js_1 = require("./lib/database.js");
Object.defineProperty(exports, "mgdb", { enumerable: true, get: function () { return __importDefault(database_js_1).default; } });
