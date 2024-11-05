import path from 'node:path'
import { readdirSync, existsSync, mkdirSync } from 'node:fs'

import Database from './database.js'
import Collection from './collection.js'

export default class Cluster {
  public name: string
  public database: Database
  public path: string
  public collections: Map<string, Collection>
  public flushed: boolean

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

    process.on('exit', () => this.flush(true))
  }

  collection(collName: string) {
    const existing = this.collections.get(collName)
    if (existing) return existing
    const collection = new Collection(this, collName)
    this.collections.set(collection.name, collection)
    return collection
  }

  async flush(sync = false) {
    if (this.flushed) return

    const savePromises: Promise<void>[] = []

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
