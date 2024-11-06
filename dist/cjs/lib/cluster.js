"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = require("node:fs");
const collection_js_1 = __importDefault(require("./collection.js"));
/**
 * Representa un clúster de colecciones en una base de datos.
 * Un clúster es un contenedor que agrupa varias colecciones dentro de una base de datos.
 */
class Cluster {
    /** El nombre del clúster. */
    name;
    /** La base de datos a la que pertenece el clúster. */
    database;
    /** La ruta donde se almacenan las colecciones del clúster. */
    path;
    /** Un mapa de las colecciones del clúster, donde la clave es el nombre de la colección y el valor es la instancia de la colección. */
    collections;
    /** Un indicador que señala si el clúster ha sido guardado o "flushed". */
    flushed;
    /**
     * Crea una nueva instancia de la clase Cluster.
     * @param {Database} database - La base de datos a la que pertenece el clúster.
     * @param {string} name - El nombre del clúster.
     */
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
        // Guardar las colecciones cuando el proceso termine
        process.on('exit', () => this.flush(true));
    }
    /**
     * Obtiene una colección por su nombre. Si la colección no existe, se crea una nueva.
     * @param {string} collName - El nombre de la colección que se desea obtener.
     * @returns {Collection} La instancia de la colección.
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
     * Guarda todas las colecciones del clúster. Si se pasa `sync = true`, el guardado será sincrónico.
     * @param {boolean} [sync=false] - Si es `true`, guarda las colecciones de forma sincrónica; si es `false`, lo hace de forma asíncrona.
     * @returns {Promise<void>} Una promesa que se resuelve cuando todas las colecciones se han guardado.
     */
    async flush(sync = false) {
        if (this.flushed)
            return;
        const savePromises = [];
        // Guardar las colecciones
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
