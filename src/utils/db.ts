import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { Project } from '../types'

interface LyricalGeniusDB extends DBSchema {
  projects: {
    key: string
    value: Project
    indexes: { 'by-date': number }
  }
  audioFiles: {
    key: string
    value: { id: string; blob: Blob }
  }
}

let dbInstance: IDBPDatabase<LyricalGeniusDB> | null = null

async function getDB() {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<LyricalGeniusDB>('lyricalgenius-db', 1, {
    upgrade(db) {
      const projectStore = db.createObjectStore('projects', { keyPath: 'id' })
      projectStore.createIndex('by-date', 'updatedAt')
      
      db.createObjectStore('audioFiles', { keyPath: 'id' })
    },
  })

  return dbInstance
}

export async function saveProject(project: Project): Promise<void> {
  const db = await getDB()
  await db.put('projects', project)
}

export async function loadProject(id: string): Promise<Project | null> {
  const db = await getDB()
  const project = await db.get('projects', id)
  return project || null
}

export async function getAllProjects(): Promise<Project[]> {
  const db = await getDB()
  const projects = await db.getAllFromIndex('projects', 'by-date')
  return projects.reverse()
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('projects', id)
  await db.delete('audioFiles', id)
}

export async function clearAllProjects(): Promise<void> {
  const db = await getDB()
  await db.clear('projects')
  await db.clear('audioFiles')
}
