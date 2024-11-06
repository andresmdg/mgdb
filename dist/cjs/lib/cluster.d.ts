import Database from './database.js';
import Collection from './collection.js';
/**
 * Representa un clúster de colecciones dentro de una base de datos.
 * Un clúster agrupa múltiples colecciones y gestiona la persistencia de sus datos.
 * @class
 */
export default class Cluster {
    /** El nombre del clúster. */
    name: string;
    /** La base de datos a la que pertenece el clúster. */
    database: Database;
    /** La ruta en el sistema de archivos donde se almacenan las colecciones del clúster. */
    path: string;
    /** Un mapa de colecciones que contiene el nombre de cada colección y su correspondiente instancia. */
    collections: Map<string, Collection>;
    /** Indica si el clúster ha sido "flushed" o si las colecciones han sido guardadas. */
    flushed: boolean;
    /**
     * Crea una nueva instancia de la clase Cluster.
     * @param {Database} database - La base de datos a la que pertenece el clúster.
     * @param {string} name - El nombre del clúster.
     * @example
     * const cluster = new Cluster(database, 'myCluster');
     */
    constructor(database: Database, name: string);
    /**
     * Obtiene una colección por su nombre. Si la colección no existe, se crea una nueva.
     * @param {string} collName - El nombre de la colección que se desea obtener.
     * @returns {Collection} La instancia de la colección correspondiente al nombre proporcionado.
     * @throws {Error} Si el nombre de la colección es inválido.
     * @example
     * const collection = cluster.collection('myCollection');
     */
    collection(collName: string): Collection;
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
    flush(sync?: boolean): Promise<void>;
}
