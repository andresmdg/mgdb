import Cluster from './cluster.js';
import { Document as DocumentType } from './types.js';
/**
 * Representa una colección de documentos dentro de un clúster.
 * Los documentos en la colección son almacenados como archivos JSON en el sistema de archivos.
 */
export default class Collection {
    /** El nombre de la colección. */
    name: string;
    /** La ruta del directorio de la colección. */
    path: string;
    /** El clúster al que pertenece la colección. */
    cluster: Cluster;
    /** Mapa de los documentos en la colección, usando el ID del documento como clave. */
    documents: Map<string, DocumentType>;
    /**
     * Crea una nueva instancia de la clase Collection.
     * @param {Cluster} cluster - El clúster al que pertenece la colección.
     * @param {string} name - El nombre de la colección.
     */
    constructor(cluster: Cluster, name: string);
    /**
     * Inserta un nuevo documento en la colección con un ID único generado.
     * @param {object} data - Los datos del documento a insertar.
     * @returns {DocumentType} El documento insertado con su ID.
     */
    insert(data: object): DocumentType;
    /**
     * Guarda todos los documentos de la colección de forma asíncrona.
     * @returns {Promise<void>} Una promesa que se resuelve cuando todos los documentos han sido guardados.
     */
    save(): Promise<void>;
    /**
     * Guarda todos los documentos de la colección de forma sincrónica.
     */
    saveSync(): void;
    /**
     * Busca documentos que coincidan con un filtro específico.
     * @param {object} [filter=null] - Un objeto de filtro para buscar documentos específicos. Si es `null`, devuelve todos los documentos.
     * @param {number} [limit=2] - El número máximo de documentos a devolver.
     * @returns {DocumentType[]} Un array con los documentos que coinciden con el filtro.
     */
    find(filter?: object | null, limit?: number): DocumentType[];
    /**
     * Busca un solo documento que coincida con el filtro proporcionado.
     * @param {object} [filter=null] - Un objeto de filtro para encontrar el documento. Si es `null`, muestra un mensaje de advertencia.
     * @returns {DocumentType|null} El documento que coincide con el filtro o `null` si no se encuentra.
     */
    findOne(filter?: object | null): DocumentType | null;
    /**
     * Encuentra un documento por su ID.
     * @param {string} id - El ID del documento a buscar.
     * @returns {DocumentType|null} El documento con el ID proporcionado o `null` si no se encuentra.
     */
    findById(id: string): DocumentType | null;
    /**
     * Actualiza un solo documento en la colección basado en un filtro.
     * @param {object} [filter=null] - El filtro que se usa para encontrar el documento. Si es `null`, muestra un mensaje de advertencia.
     * @param {object} data - Los nuevos datos que se van a actualizar en el documento.
     * @returns {DocumentType|null} El documento actualizado o `null` si no se encuentra.
     */
    updateOne(filter: (object | null) | undefined, data: object): DocumentType | null;
    /**
     * Actualiza múltiples documentos que coinciden con un filtro.
     * @param {object} [filter=null] - El filtro que se usa para encontrar los documentos. Si es `null`, muestra un mensaje de advertencia.
     * @param {object} data - Los nuevos datos que se van a actualizar en los documentos.
     * @returns {DocumentType[]} Un array con los documentos actualizados.
     */
    updateMany(filter: (object | null) | undefined, data: object): DocumentType[];
    /**
     * Elimina múltiples documentos que coinciden con un filtro.
     * @param {object} filter - El filtro utilizado para encontrar los documentos que se deben eliminar.
     * @returns {DocumentType[]} Un array con los documentos eliminados.
     */
    deleteMany(filter: object): DocumentType[];
}
