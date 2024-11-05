"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const node_crypto_1 = require("node:crypto");
const promises_1 = require("node:fs/promises");
const node_fs_1 = require("node:fs");
const helper_js_1 = __importDefault(require("../utils/helper.js"));
class Collection {
    name;
    path;
    cluster;
    documents;
    constructor(cluster, name) {
        this.name = name;
        this.cluster = cluster;
        this.path = node_path_1.default.join(cluster.path, name);
        this.documents = new Map();
        if ((0, node_fs_1.existsSync)(this.path)) {
            const files = (0, node_fs_1.readdirSync)(this.path, { withFileTypes: true });
            for (const file of files) {
                const contents = (0, node_fs_1.readFileSync)(node_path_1.default.resolve(this.path, file.name), 'utf-8');
                const doc = JSON.parse(contents);
                this.documents.set(doc._id, doc);
            }
        }
        else {
            (0, node_fs_1.mkdirSync)(this.path);
        }
    }
    insert(data) {
        const id = (0, node_crypto_1.randomUUID)();
        const item = { _id: id, ...data };
        this.documents.set(id, item);
        return item;
    }
    async save() {
        for (const doc of this.documents.values()) {
            const filePath = node_path_1.default.join(this.path, `${doc._id}.json`);
            await (0, promises_1.writeFile)(filePath, JSON.stringify(doc, null, 2), 'utf-8');
        }
    }
    saveSync() {
        for (const doc of this.documents.values()) {
            const filePath = node_path_1.default.join(this.path, `${doc._id}.json`);
            (0, node_fs_1.writeFileSync)(filePath, JSON.stringify(doc, null, 2), 'utf-8');
        }
    }
    find(filter = null, limit = 2) {
        if (!filter)
            return [...this.documents.values()];
        if (limit < 2)
            return console.log('Limit must be more than 2 or you can use the findOne function');
        const matches = [];
        for (const doc of this.documents.values()) {
            if (limit > 2 && matches.length === limit)
                break;
            if ((0, helper_js_1.default)(filter, doc))
                matches.push(doc);
        }
        return matches;
    }
    findOne(filter = null) {
        if (!filter)
            return console.log('Must set a filter');
        for (const doc of this.documents.values()) {
            if ((0, helper_js_1.default)(filter, doc))
                return doc;
        }
        return null;
    }
    findById(id) {
        return this.documents.get(id) || null;
    }
    updateOne(filter = null, data) {
        if (!filter)
            return console.log('You must provide a filter');
        const doc = [...this.documents.values()].find(doc => (0, helper_js_1.default)(filter, doc));
        if (!doc) {
            return console.log('Document not found');
        }
        const updatedDoc = { ...doc, ...data };
        this.documents.set(updatedDoc._id, updatedDoc);
        return updatedDoc;
    }
    updateMany(filter = null, data) {
        if (!filter)
            return console.log('You must provide a filter');
        const matchingDocs = [...this.documents.values()].filter(doc => (0, helper_js_1.default)(filter, doc));
        if (matchingDocs.length === 0) {
            return console.log('No documents found to update');
        }
        const updatedDocs = [];
        for (const doc of matchingDocs) {
            const updatedDoc = { ...doc, ...data };
            this.documents.set(updatedDoc._id, updatedDoc);
            updatedDocs.push(updatedDoc);
        }
        return updatedDocs;
    }
    deleteMany(filter) {
        if (!filter)
            return console.log('I cannot delete without a filter');
        const matches = this.find(filter);
        if (!matches)
            return;
        const deleted = [];
        for (const doc of matches) {
            this.documents.delete(doc._id);
            const filePath = node_path_1.default.join(this.path, `${doc._id}.json`);
            if ((0, node_fs_1.existsSync)(filePath))
                (0, node_fs_1.rmSync)(filePath);
            deleted.push(doc);
        }
        return deleted;
    }
}
exports.default = Collection;
