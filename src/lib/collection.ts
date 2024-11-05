import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { writeFile } from 'node:fs/promises'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'

import Cluster from './cluster.js'
import isEqual from '../utils/helper.js'
import { Document as DocumentType } from './types.js'

/**
 * Representa una colección de documentos dentro de un clúster.
 * Los documentos en la colección son almacenados como archivos JSON en el sistema de archivos.
 */
export default class Collection {
  /** El nombre de la colección. */
  public name: string
  /** La ruta del directorio de la colección. */
  public path: string
  /** El clúster al que pertenece la colección. */
  public cluster: Cluster
  /** Mapa de los documentos en la colección, usando el ID del documento como clave. */
  public documents: Map<string, any>

  /**
   * Crea una nueva instancia de la clase Collection.
   * @param {Cluster} cluster - El clúster al que pertenece la colección.
   * @param {string} name - El nombre de la colección.
   */
  constructor(cluster: Cluster, name: string) {
    this.name = name
    this.cluster = cluster
    this.path = path.join(cluster.path, name)
    this.documents = new Map()

    if (existsSync(this.path)) {
      const files = readdirSync(this.path, { withFileTypes: true })
      for (const file of files) {
        const contents = readFileSync(path.resolve(this.path, file.name), 'utf-8')
        const doc: DocumentType = JSON.parse(contents)
        this.documents.set(doc._id, doc)
      }
    } else {
      mkdirSync(this.path)
    }
  }

  /**
   * Inserta un nuevo documento en la colección con un ID único generado.
   * @param {object} data - Los datos del documento a insertar.
   * @returns {object} El documento insertado con su ID.
   */
  insert(data: object) {
    const id = randomUUID()
    const item = { _id: id, ...data }
    this.documents.set(id, item)
    return item
  }

  /**
   * Guarda todos los documentos de la colección de forma asíncrona.
   * @returns {Promise<void>} Una promesa que se resuelve cuando todos los documentos han sido guardados.
   */
  async save() {
    for (const doc of this.documents.values()) {
      const filePath = path.join(this.path, `${doc._id}.json`)
      await writeFile(filePath, JSON.stringify(doc, null, 2), 'utf-8')
    }
  }

  /**
   * Guarda todos los documentos de la colección de forma sincrónica.
   */
  saveSync() {
    for (const doc of this.documents.values()) {
      const filePath = path.join(this.path, `${doc._id}.json`)
      writeFileSync(filePath, JSON.stringify(doc, null, 2), 'utf-8')
    }
  }

  /**
   * Busca documentos que coincidan con un filtro específico.
   * @param {any} [filter=null] - Un objeto de filtro para buscar documentos específicos. Si es `null`, devuelve todos los documentos.
   * @param {number} [limit=2] - El número máximo de documentos a devolver.
   * @returns {Array} Un array con los documentos que coinciden con el filtro.
   */
  find(filter: any = null, limit: number = 2) {
    if (!filter) return [...this.documents.values()]
    if (limit < 2)
      return console.log('Limit must be more than 2 or you can use the findOne function')
    const matches = []
    for (const doc of this.documents.values()) {
      if (limit > 2 && matches.length === limit) break
      if (isEqual(filter, doc)) matches.push(doc)
    }

    return matches
  }

  /**
   * Busca un solo documento que coincida con el filtro proporcionado.
   * @param {any} [filter=null] - Un objeto de filtro para encontrar el documento. Si es `null`, muestra un mensaje de advertencia.
   * @returns {object|null} El documento que coincide con el filtro o `null` si no se encuentra.
   */
  findOne(filter: any = null) {
    if (!filter) return console.log('Must set a filter')
    for (const doc of this.documents.values()) {
      if (isEqual(filter, doc)) return doc
    }
    return null
  }

  /**
   * Encuentra un documento por su ID.
   * @param {string} id - El ID del documento a buscar.
   * @returns {object|null} El documento con el ID proporcionado o `null` si no se encuentra.
   */
  findById(id: string) {
    return this.documents.get(id) || null
  }

  /**
   * Actualiza un solo documento en la colección basado en un filtro.
   * @param {any} [filter=null] - El filtro que se usa para encontrar el documento. Si es `null`, muestra un mensaje de advertencia.
   * @param {object} data - Los nuevos datos que se van a actualizar en el documento.
   * @returns {object|null} El documento actualizado o `null` si no se encuentra.
   */
  updateOne(filter: any = null, data: object) {
    if (!filter) return console.log('You must provide a filter')

    const doc = [...this.documents.values()].find(doc => isEqual(filter, doc))

    if (!doc) {
      return console.log('Document not found')
    }

    const updatedDoc = { ...doc, ...data }

    this.documents.set(updatedDoc._id, updatedDoc)

    return updatedDoc
  }

  /**
   * Actualiza múltiples documentos que coinciden con un filtro.
   * @param {any} [filter=null] - El filtro que se usa para encontrar los documentos. Si es `null`, muestra un mensaje de advertencia.
   * @param {object} data - Los nuevos datos que se van a actualizar en los documentos.
   * @returns {Array} Un array con los documentos actualizados.
   */
  updateMany(filter: any = null, data: object) {
    if (!filter) return console.log('You must provide a filter')

    const matchingDocs = [...this.documents.values()].filter(doc => isEqual(filter, doc))

    if (matchingDocs.length === 0) {
      return console.log('No documents found to update')
    }

    const updatedDocs = []
    for (const doc of matchingDocs) {
      const updatedDoc = { ...doc, ...data }
      this.documents.set(updatedDoc._id, updatedDoc)
      updatedDocs.push(updatedDoc)
    }
    return updatedDocs
  }

  /**
   * Elimina múltiples documentos que coinciden con un filtro.
   * @param {any} filter - El filtro utilizado para encontrar los documentos que se deben eliminar.
   * @returns {Array} Un array con los documentos eliminados.
   */
  deleteMany(filter: any) {
    if (!filter) return console.log('I cannot delete without a filter')
    const matches = this.find(filter)
    if (!matches) return
    const deleted = []
    for (const doc of matches) {
      this.documents.delete(doc._id)
      const filePath = path.join(this.path, `${doc._id}.json`)
      if (existsSync(filePath)) rmSync(filePath)
      deleted.push(doc)
    }

    return deleted
  }
}
