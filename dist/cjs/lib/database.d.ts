import Cluster from './cluster.js';
import { dbOptions } from './types.js';
export default class Database {
    clusters: Map<string, Cluster>;
    dirname: string;
    path: string;
    constructor(options?: dbOptions);
    connect(clusterName: string): Cluster;
}
