"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = require("node:fs");
const cluster_js_1 = __importDefault(require("./cluster.js"));
/**
 * Representa una base de datos que contiene múltiples clústeres.
 * Cada clúster puede contener varias colecciones.
 */
class Database {
    /** Mapa de clústeres, donde la clave es el nombre del clúster y el valor es la instancia de `Cluster`. */
    clusters;
    /** El nombre del directorio principal donde se almacenan los clústeres. */
    dirname;
    /** La ruta absoluta del directorio principal de la base de datos. */
    path;
    /**
     * Crea una nueva instancia de la base de datos.
     * @param {dbOptions} [options={ dirname: 'db' }] - Opciones para la configuración de la base de datos. Por defecto, el directorio de la base de datos es `db`.
     */
    constructor(options = { dirname: 'db' }) {
        this.clusters = new Map();
        this.dirname = options.dirname;
        this.path = node_path_1.default.join(process.cwd(), this.dirname);
        if ((0, node_fs_1.existsSync)(this.path)) {
            const entries = (0, node_fs_1.readdirSync)(this.path, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isFile())
                    continue;
                this.clusters.set(entry.name, new cluster_js_1.default(this, entry.name));
            }
        }
        else {
            (0, node_fs_1.mkdirSync)(this.path);
        }
    }
    /**
     * Conecta a un clúster existente o lo crea si no existe.
     * @param {string} clusterName - El nombre del clúster al que se desea conectar.
     * @returns {Cluster} La instancia del clúster conectado.
     */
    connect(clusterName) {
        const existing = this.clusters.get(clusterName);
        if (existing)
            return existing;
        const cluster = new cluster_js_1.default(this, clusterName);
        this.clusters.set(clusterName, cluster);
        return cluster;
    }
}
exports.default = Database;
