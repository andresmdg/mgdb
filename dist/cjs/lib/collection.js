"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const node_crypto_1 = require("node:crypto");
const promises_1 = require("node:fs/promises");
const node_fs_1 = require("node:fs");
const helper_js_1 = __importDefault(require("../utils/helper.js"));
/**
 * Representa una colección de documentos dentro de un clúster.
 * Los documentos en la colección son almacenados como archivos JSON en el sistema de archivos.
 */
class Collection {
    /** El nombre de la colección. */
    name;
    /** La ruta del directorio de la colección. */
    path;
    /** El clúster al que pertenece la colección. */
    cluster;
    /** Mapa de los documentos en la colección, usando el ID del documento como clave. */
    documents;
    /**
     * Crea una nueva instancia de la clase Collection.
     * @param {Cluster} cluster - El clúster al que pertenece la colección.
     * @param {string} name - El nombre de la colección.
     */
    constructor(cluster, name) {
        this.name = name;
        this.cluster = cluster;
        this.path = node_path_1.default.join(cluster.path, name);
        this.documents = new Map();
        if ((0, node_fs_1.existsSync)(this.path)) {
            const files = (0, node_fs_1.readdirSync)(this.path, { withFileTypes: true });
            for (const file of files) {
                const contents = (0, node_fs_1.readFileSync)(node_path_1.default.resolve(this.path, file.name), 'utf-8');
                const doc = JSON.parse(contents);
                this.documents.set(doc._id, doc);
            }
        }
        else {
            (0, node_fs_1.mkdirSync)(this.path);
        }
    }
    /**
     * Inserta un nuevo documento en la colección con un ID único generado.
     * @param {object} data - Los datos del documento a insertar.
     * @returns {object} El documento insertado con su ID.
     */
    insert(data) {
        const id = (0, node_crypto_1.randomUUID)();
        const item = { _id: id, ...data };
        this.documents.set(id, item);
        return item;
    }
    /**
     * Guarda todos los documentos de la colección de forma asíncrona.
     * @returns {Promise<void>} Una promesa que se resuelve cuando todos los documentos han sido guardados.
     */
    async save() {
        for (const doc of this.documents.values()) {
            const filePath = node_path_1.default.join(this.path, `${doc._id}.json`);
            await (0, promises_1.writeFile)(filePath, JSON.stringify(doc, null, 2), 'utf-8');
        }
    }
    /**
     * Guarda todos los documentos de la colección de forma sincrónica.
     */
    saveSync() {
        for (const doc of this.documents.values()) {
            const filePath = node_path_1.default.join(this.path, `${doc._id}.json`);
            (0, node_fs_1.writeFileSync)(filePath, JSON.stringify(doc, null, 2), 'utf-8');
        }
    }
    /**
     * Busca documentos que coincidan con un filtro específico.
     * @param {any} [filter=null] - Un objeto de filtro para buscar documentos específicos. Si es `null`, devuelve todos los documentos.
     * @param {number} [limit=2] - El número máximo de documentos a devolver.
     * @returns {Array} Un array con los documentos que coinciden con el filtro.
     */
    find(filter = null, limit = 2) {
        if (!filter)
            return [...this.documents.values()];
        if (limit < 2)
            return console.log('Limit must be more than 2 or you can use the findOne function');
        const matches = [];
        for (const doc of this.documents.values()) {
            if (limit > 2 && matches.length === limit)
                break;
            if ((0, helper_js_1.default)(filter, doc))
                matches.push(doc);
        }
        return matches;
    }
    /**
     * Busca un solo documento que coincida con el filtro proporcionado.
     * @param {any} [filter=null] - Un objeto de filtro para encontrar el documento. Si es `null`, muestra un mensaje de advertencia.
     * @returns {object|null} El documento que coincide con el filtro o `null` si no se encuentra.
     */
    findOne(filter = null) {
        if (!filter)
            return console.log('Must set a filter');
        for (const doc of this.documents.values()) {
            if ((0, helper_js_1.default)(filter, doc))
                return doc;
        }
        return null;
    }
    /**
     * Encuentra un documento por su ID.
     * @param {string} id - El ID del documento a buscar.
     * @returns {object|null} El documento con el ID proporcionado o `null` si no se encuentra.
     */
    findById(id) {
        return this.documents.get(id) || null;
    }
    /**
     * Actualiza un solo documento en la colección basado en un filtro.
     * @param {any} [filter=null] - El filtro que se usa para encontrar el documento. Si es `null`, muestra un mensaje de advertencia.
     * @param {object} data - Los nuevos datos que se van a actualizar en el documento.
     * @returns {object|null} El documento actualizado o `null` si no se encuentra.
     */
    updateOne(filter = null, data) {
        if (!filter)
            return console.log('You must provide a filter');
        const doc = [...this.documents.values()].find(doc => (0, helper_js_1.default)(filter, doc));
        if (!doc) {
            return console.log('Document not found');
        }
        const updatedDoc = { ...doc, ...data };
        this.documents.set(updatedDoc._id, updatedDoc);
        return updatedDoc;
    }
    /**
     * Actualiza múltiples documentos que coinciden con un filtro.
     * @param {any} [filter=null] - El filtro que se usa para encontrar los documentos. Si es `null`, muestra un mensaje de advertencia.
     * @param {object} data - Los nuevos datos que se van a actualizar en los documentos.
     * @returns {Array} Un array con los documentos actualizados.
     */
    updateMany(filter = null, data) {
        if (!filter)
            return console.log('You must provide a filter');
        const matchingDocs = [...this.documents.values()].filter(doc => (0, helper_js_1.default)(filter, doc));
        if (matchingDocs.length === 0) {
            return console.log('No documents found to update');
        }
        const updatedDocs = [];
        for (const doc of matchingDocs) {
            const updatedDoc = { ...doc, ...data };
            this.documents.set(updatedDoc._id, updatedDoc);
            updatedDocs.push(updatedDoc);
        }
        return updatedDocs;
    }
    /**
     * Elimina múltiples documentos que coinciden con un filtro.
     * @param {any} filter - El filtro utilizado para encontrar los documentos que se deben eliminar.
     * @returns {Array} Un array con los documentos eliminados.
     */
    deleteMany(filter) {
        if (!filter)
            return console.log('I cannot delete without a filter');
        const matches = this.find(filter);
        if (!matches)
            return;
        const deleted = [];
        for (const doc of matches) {
            this.documents.delete(doc._id);
            const filePath = node_path_1.default.join(this.path, `${doc._id}.json`);
            if ((0, node_fs_1.existsSync)(filePath))
                (0, node_fs_1.rmSync)(filePath);
            deleted.push(doc);
        }
        return deleted;
    }
}
exports.default = Collection;
