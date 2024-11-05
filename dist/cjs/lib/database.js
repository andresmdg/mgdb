"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = require("node:fs");
const cluster_js_1 = __importDefault(require("./cluster.js"));
class Database {
    clusters;
    dirname;
    path;
    constructor(options = { dirname: 'db' }) {
        this.clusters = new Map();
        this.dirname = options.dirname;
        this.path = node_path_1.default.join(process.cwd(), this.dirname);
        if ((0, node_fs_1.existsSync)(this.path)) {
            const entries = (0, node_fs_1.readdirSync)(this.path, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isFile())
                    continue;
                this.clusters.set(entry.name, new cluster_js_1.default(this, entry.name));
            }
        }
        else {
            (0, node_fs_1.mkdirSync)(this.path);
        }
    }
    connect(clusterName) {
        const existing = this.clusters.get(clusterName);
        if (existing)
            return existing;
        const cluster = new cluster_js_1.default(this, clusterName);
        this.clusters.set(clusterName, cluster);
        return cluster;
    }
}
exports.default = Database;
