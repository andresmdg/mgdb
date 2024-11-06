import Cluster from './cluster.js';
import { dbOptions } from './types.js';
/**
 * Representa una base de datos que contiene múltiples clústeres.
 * Cada clúster puede contener varias colecciones.
 *
 * Esta clase gestiona la creación y conexión de clústeres, así como el almacenamiento
 * físico de los datos en el sistema de archivos.
 *
 * @class
 */
export default class Database {
    /**
     * Mapa de clústeres, donde la clave es el nombre del clúster y el valor es la instancia de `Cluster`.
     * @type {Map<string, Cluster>}
     */
    clusters: Map<string, Cluster>;
    /**
     * El nombre del directorio principal donde se almacenan los clústeres.
     * @type {string}
     */
    dirname: string;
    /**
     * La ruta absoluta del directorio principal de la base de datos.
     * @type {string}
     */
    path: string;
    /**
     * Crea una nueva instancia de la base de datos.
     *
     * La base de datos se almacena en un directorio especificado en las opciones.
     * Si el directorio no existe, se crea automáticamente. Luego, se cargan los clústeres
     * existentes del directorio.
     *
     * @param {dbOptions} [options={ dirname: 'db' }] - Opciones para la configuración de la base de datos.
     * Si no se especifica el directorio, se usará el valor predeterminado `'db'`.
     */
    constructor(options?: dbOptions);
    /**
     * Conecta a un clúster existente o lo crea si no existe.
     *
     * Si el clúster con el nombre especificado ya existe, se devuelve la instancia existente.
     * Si no existe, se crea un nuevo clúster con el nombre dado y se guarda en el mapa de clústeres.
     *
     * @param {string} clusterName - El nombre del clúster al que se desea conectar.
     * @returns {Cluster} La instancia del clúster conectado.
     *
     * @example
     * const cluster = db.connect('myCluster');
     */
    connect(clusterName: string): Cluster;
}
