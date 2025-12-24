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
  
  if (project.audioFile) {
    await db.put('audioFiles', {
      id: project.id,
      blob: project.audioFile,
    })
  }
  
  const projectToSave = { ...project, audioFile: null }
  await db.put('projects', projectToSave)
}

export async function loadProject(id: string): Promise<Project | null> {
  const db = await getDB()
  const project = await db.get('projects', id)
  
  if (!project) return null
  
  const audioFile = await db.get('audioFiles', id)
  if (audioFile) {
    project.audioFile = new File([audioFile.blob], project.name, { type: audioFile.blob.type })
  }
  
  return project
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
