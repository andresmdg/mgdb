import Cluster from './cluster.js';
import { dbOptions } from './types.js';
/**
 * Representa una base de datos que contiene múltiples clústeres.
 * Cada clúster puede contener varias colecciones.
 */
export default class Database {
    /** Mapa de clústeres, donde la clave es el nombre del clúster y el valor es la instancia de `Cluster`. */
    clusters: Map<string, Cluster>;
    /** El nombre del directorio principal donde se almacenan los clústeres. */
    dirname: string;
    /** La ruta absoluta del directorio principal de la base de datos. */
    path: string;
    /**
     * Crea una nueva instancia de la base de datos.
     * @param {dbOptions} [options={ dirname: 'db' }] - Opciones para la configuración de la base de datos. Por defecto, el directorio de la base de datos es `db`.
     */
    constructor(options?: dbOptions);
    /**
     * Conecta a un clúster existente o lo crea si no existe.
     * @param {string} clusterName - El nombre del clúster al que se desea conectar.
     * @returns {Cluster} La instancia del clúster conectado.
     */
    connect(clusterName: string): Cluster;
}
