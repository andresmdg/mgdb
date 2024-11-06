import path from 'node:path';
import { readdirSync, existsSync, mkdirSync } from 'node:fs';
import Collection from './collection.js';
/**
 * Representa un clúster de colecciones dentro de una base de datos.
 * Un clúster agrupa múltiples colecciones y gestiona la persistencia de sus datos.
 * @class
 */
export default class Cluster {
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
        this.path = path.join(database.path, name);
        this.collections = new Map();
        this.flushed = false;
        // Si la ruta ya existe, leer las colecciones dentro de ella
        if (existsSync(this.path)) {
            const entries = readdirSync(this.path, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    const collection = new Collection(this, entry.name);
                    this.collections.set(entry.name, collection);
                }
            }
        }
        else {
            // Si la ruta no existe, crearla
            mkdirSync(this.path);
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
        const collection = new Collection(this, collName);
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
