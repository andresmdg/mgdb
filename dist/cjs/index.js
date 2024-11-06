"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Exporta la clase `Database` como la exportación por defecto.
 *
 * @module
 * @default
 *
 * @returns {Database} La clase `Database` que se puede utilizar para crear instancias de bases de datos.
 */
const database_js_1 = __importDefault(require("./lib/database.js"));
// Exporta Database como el valor por defecto
exports.default = database_js_1.default;
