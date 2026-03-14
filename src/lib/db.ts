import { openDB, type DBSchema, type IDBPDatabase } from "idb";

export type NoteType = "standard" | "future-letter" | "journal";
export type Folder = "Work" | "Personal" | "Ideas" | "Journal" | "Legacy" | "Uncategorized";

export interface Note {
  id: string;
  title: string;
  content: string;
  type: NoteType;
  folder: Folder;
  sentiment: string;
  createdAt: number;
  updatedAt: number;
  // Future letter fields
  unlockDate?: number;
  sealed?: boolean;
  // Meta
  wordCount: number;
  tags: string[];
}

export interface AppSettings {
  id: string;
  writingStreak: number;
  lastWriteDate: string;
  pomodoroMinutes: number;
}

interface AeternaDB extends DBSchema {
  notes: {
    key: string;
    value: Note;
    indexes: {
      "by-folder": Folder;
      "by-type": NoteType;
      "by-updated": number;
      "by-created": number;
    };
  };
  settings: {
    key: string;
    value: AppSettings;
  };
}

let dbPromise: Promise<IDBPDatabase<AeternaDB>>;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<AeternaDB>("aeterna-db", 1, {
      upgrade(db) {
        const noteStore = db.createObjectStore("notes", { keyPath: "id" });
        noteStore.createIndex("by-folder", "folder");
        noteStore.createIndex("by-type", "type");
        noteStore.createIndex("by-updated", "updatedAt");
        noteStore.createIndex("by-created", "createdAt");
        db.createObjectStore("settings", { keyPath: "id" });
      },
    });
  }
  return dbPromise;
}

// Notes CRUD
export async function getAllNotes(): Promise<Note[]> {
  const db = await getDB();
  const notes = await db.getAll("notes");
  return notes.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getNote(id: string): Promise<Note | undefined> {
  const db = await getDB();
  return db.get("notes", id);
}

export async function saveNote(note: Note): Promise<void> {
  const db = await getDB();
  await db.put("notes", note);
}

export async function deleteNote(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("notes", id);
}

export async function getNotesByFolder(folder: Folder): Promise<Note[]> {
  const db = await getDB();
  return db.getAllFromIndex("notes", "by-folder", folder);
}

// Settings
export async function getSettings(): Promise<AppSettings> {
  const db = await getDB();
  const s = await db.get("settings", "main");
  return s || { id: "main", writingStreak: 0, lastWriteDate: "", pomodoroMinutes: 25 };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const db = await getDB();
  await db.put("settings", settings);
}

// Backup / Restore
export async function exportAll(): Promise<string> {
  const db = await getDB();
  const notes = await db.getAll("notes");
  const settings = await db.get("settings", "main");
  return JSON.stringify({ notes, settings, exportedAt: Date.now(), version: 1 });
}

export async function importAll(json: string): Promise<number> {
  const data = JSON.parse(json);
  const db = await getDB();
  const tx = db.transaction("notes", "readwrite");
  for (const note of data.notes || []) {
    await tx.store.put(note);
  }
  await tx.done;
  if (data.settings) {
    await db.put("settings", data.settings);
  }
  return (data.notes || []).length;
}
