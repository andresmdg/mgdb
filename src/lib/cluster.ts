import path from 'node:path'
import { readdirSync, existsSync, mkdirSync } from 'node:fs'

import Database from './database.js'
import Collection from './collection.js'

/**
 * Representa un clúster de colecciones en una base de datos.
 * Un clúster es un contenedor que agrupa varias colecciones dentro de una base de datos.
 */
export default class Cluster {
  /** El nombre del clúster. */
  public name: string
  /** La base de datos a la que pertenece el clúster. */
  public database: Database
  /** La ruta donde se almacenan las colecciones del clúster. */
  public path: string
  /** Un mapa de las colecciones del clúster, donde la clave es el nombre de la colección y el valor es la instancia de la colección. */
  public collections: Map<string, Collection>
  /** Un indicador que señala si el clúster ha sido guardado o "flushed". */
  public flushed: boolean

  /**
   * Crea una nueva instancia de la clase Cluster.
   * @param {Database} database - La base de datos a la que pertenece el clúster.
   * @param {string} name - El nombre del clúster.
   */
  constructor(database: Database, name: string) {
    this.name = name
    this.database = database
    this.path = path.join(database.path, name)
    this.collections = new Map()
    this.flushed = false

    if (existsSync(this.path)) {
      const entries = readdirSync(this.path, { withFileTypes: true })
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const collection = new Collection(this, entry.name)
          this.collections.set(entry.name, collection)
        }
      }
    } else {
      mkdirSync(this.path)
    }

    // Guardar las colecciones cuando el proceso termine
    process.on('exit', () => this.flush(true))
  }

  /**
   * Obtiene una colección por su nombre. Si la colección no existe, se crea una nueva.
   * @param {string} collName - El nombre de la colección que se desea obtener.
   * @returns {Collection} La instancia de la colección.
   */
  collection(collName: string): Collection {
    const existing = this.collections.get(collName)
    if (existing) return existing
    const collection = new Collection(this, collName)
    this.collections.set(collection.name, collection)
    return collection
  }

  /**
   * Guarda todas las colecciones del clúster. Si se pasa `sync = true`, el guardado será sincrónico.
   * @param {boolean} [sync=false] - Si es `true`, guarda las colecciones de forma sincrónica; si es `false`, lo hace de forma asíncrona.
   * @returns {Promise<void>} Una promesa que se resuelve cuando todas las colecciones se han guardado.
   */
  async flush(sync = false): Promise<void> {
    if (this.flushed) return

    const savePromises: Promise<void>[] = []

    // Guardar las colecciones
    for (const collection of this.collections.values()) {
      if (sync) {
        collection.saveSync()
      } else {
        savePromises.push(collection.save())
      }
    }

    if (!sync) {
      await Promise.all(savePromises)
      console.log('All collections saved')
    }
    this.flushed = true
  }
}
