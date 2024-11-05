"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = require("node:fs");
const collection_js_1 = __importDefault(require("./collection.js"));
class Cluster {
    name;
    database;
    path;
    collections;
    flushed;
    constructor(database, name) {
        this.name = name;
        this.database = database;
        this.path = node_path_1.default.join(database.path, name);
        this.collections = new Map();
        this.flushed = false;
        if ((0, node_fs_1.existsSync)(this.path)) {
            const entries = (0, node_fs_1.readdirSync)(this.path, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    const collection = new collection_js_1.default(this, entry.name);
                    this.collections.set(entry.name, collection);
                }
            }
        }
        else {
            (0, node_fs_1.mkdirSync)(this.path);
        }
        process.on('exit', () => this.flush(true));
    }
    collection(collName) {
        const existing = this.collections.get(collName);
        if (existing)
            return existing;
        const collection = new collection_js_1.default(this, collName);
        this.collections.set(collection.name, collection);
        return collection;
    }
    async flush(sync = false) {
        if (this.flushed)
            return;
        const savePromises = [];
        for (const collection of this.collections.values()) {
            if (sync) {
                collection.saveSync();
            }
            else {
                savePromises.push(collection.save());
            }
        }
        if (!sync) {
            await Promise.all(savePromises);
            console.log('All collections saved');
        }
        this.flushed = true;
    }
}
exports.default = Cluster;
