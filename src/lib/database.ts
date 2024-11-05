import path from 'node:path'
import { existsSync, readdirSync, mkdirSync } from 'node:fs'

import Cluster from './cluster.js'
import { dbOptions } from './types.js'

export default class Database {
  public clusters: Map<string, Cluster>
  public dirname: string
  public path: string

  constructor(options: dbOptions = { dirname: 'db' }) {
    this.clusters = new Map()
    this.dirname = options.dirname
    this.path = path.join(process.cwd(), this.dirname)

    if (existsSync(this.path)) {
      const entries = readdirSync(this.path, { withFileTypes: true })
      for (const entry of entries) {
        if (entry.isFile()) continue
        this.clusters.set(entry.name, new Cluster(this, entry.name))
      }
    } else {
      mkdirSync(this.path)
    }
  }

  connect(clusterName: string) {
    const existing = this.clusters.get(clusterName)
    if (existing) return existing
    const cluster = new Cluster(this, clusterName)
    this.clusters.set(clusterName, cluster)
    return cluster
  }
}
