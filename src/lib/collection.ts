import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { writeFile } from 'node:fs/promises'
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'

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
  public documents: Map<string, DocumentType>

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
        const contents = readFileSync(
          path.resolve(this.path, file.name),
          'utf-8'
        )
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
   * @returns {DocumentType} El documento insertado con su ID.
   */
  insert(data: object): DocumentType {
    const id = randomUUID()
    const item: DocumentType = { _id: id, ...data }
    this.documents.set(id, item)
    return item
  }

  /**
   * Guarda todos los documentos de la colección de forma asíncrona.
   * @returns {Promise<void>} Una promesa que se resuelve cuando todos los documentos han sido guardados.
   */
  async save(): Promise<void> {
    for (const doc of this.documents.values()) {
      const filePath = path.join(this.path, `${doc._id}.json`)
      await writeFile(filePath, JSON.stringify(doc, null, 2), 'utf-8')
    }
  }

  /**
   * Guarda todos los documentos de la colección de forma sincrónica.
   */
  saveSync(): void {
    for (const doc of this.documents.values()) {
      const filePath = path.join(this.path, `${doc._id}.json`)
      writeFileSync(filePath, JSON.stringify(doc, null, 2), 'utf-8')
    }
  }

  /**
   * Busca documentos que coincidan con un filtro específico.
   * @param {object} [filter=null] - Un objeto de filtro para buscar documentos específicos. Si es `null`, devuelve todos los documentos.
   * @param {number} [limit=2] - El número máximo de documentos a devolver.
   * @returns {DocumentType[]} Un array con los documentos que coinciden con el filtro.
   */
  find(filter: object | null = null, limit: number = 2): DocumentType[] {
    if (!filter) return [...this.documents.values()]
    if (limit < 2) return []
    const matches: DocumentType[] = []
    for (const doc of this.documents.values()) {
      if (limit > 2 && matches.length === limit) break
      if (isEqual(filter, doc)) matches.push(doc)
    }

    return matches
  }

  /**
   * Busca un solo documento que coincida con el filtro proporcionado.
   * @param {object} [filter=null] - Un objeto de filtro para encontrar el documento. Si es `null`, muestra un mensaje de advertencia.
   * @returns {DocumentType|null} El documento que coincide con el filtro o `null` si no se encuentra.
   */
  findOne(filter: object | null = null): DocumentType | null {
    if (!filter) return null
    for (const doc of this.documents.values()) {
      if (isEqual(filter, doc)) return doc
    }
    return null
  }

  /**
   * Encuentra un documento por su ID.
   * @param {string} id - El ID del documento a buscar.
   * @returns {DocumentType|null} El documento con el ID proporcionado o `null` si no se encuentra.
   */
  findById(id: string): DocumentType | null {
    return this.documents.get(id) || null
  }

  /**
   * Actualiza un solo documento en la colección basado en un filtro.
   * @param {object} [filter=null] - El filtro que se usa para encontrar el documento. Si es `null`, muestra un mensaje de advertencia.
   * @param {object} data - Los nuevos datos que se van a actualizar en el documento.
   * @returns {DocumentType|null} El documento actualizado o `null` si no se encuentra.
   */
  updateOne(filter: object | null = null, data: object): DocumentType | null {
    if (!filter) return null

    const doc = [...this.documents.values()].find(doc => isEqual(filter, doc))

    if (!doc) {
      return null
    }

    const updatedDoc: DocumentType = { ...doc, ...data }

    this.documents.set(updatedDoc._id, updatedDoc)

    return updatedDoc
  }

  /**
   * Actualiza múltiples documentos que coinciden con un filtro.
   * @param {object} [filter=null] - El filtro que se usa para encontrar los documentos. Si es `null`, muestra un mensaje de advertencia.
   * @param {object} data - Los nuevos datos que se van a actualizar en los documentos.
   * @returns {DocumentType[]} Un array con los documentos actualizados.
   */
  updateMany(filter: object | null = null, data: object): DocumentType[] {
    if (!filter) return []

    const matchingDocs: DocumentType[] = [...this.documents.values()].filter(
      doc => isEqual(filter, doc)
    )

    if (matchingDocs.length === 0) {
      return []
    }

    const updatedDocs: DocumentType[] = []
    for (const doc of matchingDocs) {
      const updatedDoc: DocumentType = { ...doc, ...data }
      this.documents.set(updatedDoc._id, updatedDoc)
      updatedDocs.push(updatedDoc)
    }
    return updatedDocs
  }

  /**
   * Elimina múltiples documentos que coinciden con un filtro.
   * @param {object} filter - El filtro utilizado para encontrar los documentos que se deben eliminar.
   * @returns {DocumentType[]} Un array con los documentos eliminados.
   */
  deleteMany(filter: object): DocumentType[] {
    if (!filter) return []
    const matches = this.find(filter)
    if (!matches) return []
    const deleted: DocumentType[] = []
    for (const doc of matches) {
      this.documents.delete(doc._id)
      const filePath = path.join(this.path, `${doc._id}.json`)
      if (existsSync(filePath)) rmSync(filePath)
      deleted.push(doc)
    }

    return deleted
  }
}
