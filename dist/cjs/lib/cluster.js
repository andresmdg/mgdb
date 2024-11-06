"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = require("node:fs");
const collection_js_1 = __importDefault(require("./collection.js"));
/**
 * Representa un clúster de colecciones dentro de una base de datos.
 * Un clúster agrupa múltiples colecciones y gestiona la persistencia de sus datos.
 * @class
 */
class Cluster {
    /** El nombre del clúster. */
    name;
    /** La base de datos a la que pertenece el clúster. */
    database;
    /** La ruta en el sistema de archivos donde se almacenan las colecciones del clúster. */
    path;
    /** Un mapa de colecciones que contiene el nombre de cada colección y su correspondiente instancia. */
    collections;
    /** Indica si el clúster ha sido "flushed" o si las colecciones han sido guardadas. */
    flushed;
    /**
     * Crea una nueva instancia de la clase Cluster.
     * @param {Database} database - La base de datos a la que pertenece el clúster.
     * @param {string} name - El nombre del clúster.
     * @example
     * const cluster = new Cluster(database, 'myCluster');
     */
    constructor(database, name) {
        this.name = name;
        this.database = database;
        this.path = node_path_1.default.join(database.path, name);
        this.collections = new Map();
        this.flushed = false;
        // Si la ruta ya existe, leer las colecciones dentro de ella
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
            // Si la ruta no existe, crearla
            (0, node_fs_1.mkdirSync)(this.path);
        }
        // Guardar las colecciones cuando el proceso termine
        process.on('exit', () => this.flush(true));
    }
    /**
     * Obtiene una colección por su nombre. Si la colección no existe, se crea una nueva.
     * @param {string} collName - El nombre de la colección que se desea obtener.
     * @returns {Collection} La instancia de la colección correspondiente al nombre proporcionado.
     * @throws {Error} Si el nombre de la colección es inválido.
     * @example
     * const collection = cluster.collection('myCollection');
     */
    collection(collName) {
        const existing = this.collections.get(collName);
        if (existing)
            return existing;
        const collection = new collection_js_1.default(this, collName);
        this.collections.set(collection.name, collection);
        return collection;
    }
    /**
     * Guarda todas las colecciones del clúster. Si `sync` es `true`, las colecciones se guardan de forma sincrónica.
     * @param {boolean} [sync=false] - Si es `true`, guarda las colecciones de forma sincrónica; si es `false`, se hace de forma asíncrona.
     * @returns {Promise<void>} Una promesa que se resuelve cuando todas las colecciones se han guardado.
     * @example
     * // Guardado asíncrono
     * await cluster.flush(false);
     *
     * // Guardado sincrónico
     * cluster.flush(true);
     */
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
