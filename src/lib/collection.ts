import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { writeFile } from 'node:fs/promises'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'

import Cluster from './cluster.js'
import isEqual from '../utils/helper.js'
import { Document as DocumentType } from './types.js'

export default class Collection {
  public name: string
  public path: string
  public cluster: Cluster
  public documents: Map<string, any>

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

  insert(data: object) {
    const id = randomUUID()
    const item = { _id: id, ...data }
    this.documents.set(id, item)
    return item
  }

  async save() {
    for (const doc of this.documents.values()) {
      const filePath = path.join(this.path, `${doc._id}.json`)
      await writeFile(filePath, JSON.stringify(doc, null, 2), 'utf-8')
    }
  }

  saveSync() {
    for (const doc of this.documents.values()) {
      const filePath = path.join(this.path, `${doc._id}.json`)
      writeFileSync(filePath, JSON.stringify(doc, null, 2), 'utf-8')
    }
  }

  find(filter: any = null, limit: number = 2) {
    if (!filter) return [...this.documents.values()]
    if (limit < 2) return console.log('Limit must be more than 2 or u can use the findOne Function')
    const matches = []
    for (const doc of this.documents.values()) {
      if (limit > 2 && matches.length === limit) break
      if (isEqual(filter, doc)) matches.push(doc)
    }

    return matches
  }

  findOne(filter: any = null) {
    if (!filter) return console.log('Must be a set a filter')
    for (const doc of this.documents.values()) {
      if (isEqual(filter, doc)) return doc
    }
    return null
  }

  findById(id: string) {
    return this.documents.get(id) || null
  }

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
