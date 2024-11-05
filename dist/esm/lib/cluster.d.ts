import Database from './database.js';
import Collection from './collection.js';
export default class Cluster {
    name: string;
    database: Database;
    path: string;
    collections: Map<string, Collection>;
    flushed: boolean;
    constructor(database: Database, name: string);
    collection(collName: string): Collection;
    flush(sync?: boolean): Promise<void>;
}
