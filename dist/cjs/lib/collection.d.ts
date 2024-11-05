import Cluster from './cluster.js';
export default class Collection {
    name: string;
    path: string;
    cluster: Cluster;
    documents: Map<string, any>;
    constructor(cluster: Cluster, name: string);
    insert(data: object): {
        _id: `${string}-${string}-${string}-${string}-${string}`;
    };
    save(): Promise<void>;
    saveSync(): void;
    find(filter?: any, limit?: number): void | any[];
    findOne(filter?: any): any;
    findById(id: string): any;
    updateOne(filter: any, data: object): any;
    updateMany(filter: any, data: object): void | any[];
    deleteMany(filter: any): void | any[];
}
