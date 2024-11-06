import Database from './database.js';
import Collection from './collection.js';
/**
 * Representa un clúster de colecciones en una base de datos.
 * Un clúster es un contenedor que agrupa varias colecciones dentro de una base de datos.
 */
export default class Cluster {
    /** El nombre del clúster. */
    name: string;
    /** La base de datos a la que pertenece el clúster. */
    database: Database;
    /** La ruta donde se almacenan las colecciones del clúster. */
    path: string;
    /** Un mapa de las colecciones del clúster, donde la clave es el nombre de la colección y el valor es la instancia de la colección. */
    collections: Map<string, Collection>;
    /** Un indicador que señala si el clúster ha sido guardado o "flushed". */
    flushed: boolean;
    /**
     * Crea una nueva instancia de la clase Cluster.
     * @param {Database} database - La base de datos a la que pertenece el clúster.
     * @param {string} name - El nombre del clúster.
     */
    constructor(database: Database, name: string);
    /**
     * Obtiene una colección por su nombre. Si la colección no existe, se crea una nueva.
     * @param {string} collName - El nombre de la colección que se desea obtener.
     * @returns {Collection} La instancia de la colección.
     */
    collection(collName: string): Collection;
    /**
     * Guarda todas las colecciones del clúster. Si se pasa `sync = true`, el guardado será sincrónico.
     * @param {boolean} [sync=false] - Si es `true`, guarda las colecciones de forma sincrónica; si es `false`, lo hace de forma asíncrona.
     * @returns {Promise<void>} Una promesa que se resuelve cuando todas las colecciones se han guardado.
     */
    flush(sync?: boolean): Promise<void>;
}
