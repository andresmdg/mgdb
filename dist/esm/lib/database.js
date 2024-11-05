import path from 'node:path';
import { existsSync, readdirSync, mkdirSync } from 'node:fs';
import Cluster from './cluster.js';
export default class Database {
    clusters;
    dirname;
    path;
    constructor(options = { dirname: 'db' }) {
        this.clusters = new Map();
        this.dirname = options.dirname;
        this.path = path.join(process.cwd(), this.dirname);
        if (existsSync(this.path)) {
            const entries = readdirSync(this.path, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isFile())
                    continue;
                this.clusters.set(entry.name, new Cluster(this, entry.name));
            }
        }
        else {
            mkdirSync(this.path);
        }
    }
    connect(clusterName) {
        const existing = this.clusters.get(clusterName);
        if (existing)
            return existing;
        const cluster = new Cluster(this, clusterName);
        this.clusters.set(clusterName, cluster);
        return cluster;
    }
}
