import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.resolve(__dirname, '../../data')
const DB_PATH = path.join(DATA_DIR, 'meetings.db')

// Ensure /data directory exists before opening DB
// (better-sqlite3 throws SQLITE_CANTOPEN if parent dir is missing)
fs.mkdirSync(DATA_DIR, { recursive: true })

export const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS meetings (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS action_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    meeting_id  INTEGER NOT NULL,
    description TEXT NOT NULL,
    assignee    TEXT,
    priority    TEXT NOT NULL CHECK(priority IN ('low','medium','high')),
    status      TEXT NOT NULL DEFAULT 'todo' CHECK(status IN ('todo','in-progress','done')),
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (meeting_id) REFERENCES meetings(id)
  );

  CREATE INDEX IF NOT EXISTS idx_action_items_meeting_id
    ON action_items(meeting_id);
  CREATE INDEX IF NOT EXISTS idx_action_items_status
    ON action_items(status);
`)

// Prepared statements -- compiled once, reused on every call
const insertMeeting = db.prepare(
  'INSERT INTO meetings (title, created_at) VALUES (@title, @created_at)'
)
const insertItem = db.prepare(
  'INSERT INTO action_items (meeting_id, description, assignee, priority) VALUES (@meeting_id, @description, @assignee, @priority)'
)

export const getLatestMeeting = db.prepare(
  'SELECT * FROM meetings ORDER BY id DESC LIMIT 1'
)
export const getItemsByMeeting = db.prepare(
  'SELECT * FROM action_items WHERE meeting_id = ? ORDER BY id ASC'
)

// saveMeeting wraps the insert in a transaction -- both meeting and items
// either succeed together or fail together (automatic rollback on throw)
export const saveMeeting = db.transaction(
  (title: string, items: Array<{ description: string; assignee?: string | null; priority: string }>) => {
    const { lastInsertRowid } = insertMeeting.run({
      title,
      created_at: new Date().toISOString(),
    })
    // IMPORTANT: better-sqlite3 returns lastInsertRowid as bigint -- always convert
    const meetingId = Number(lastInsertRowid)
    for (const item of items) {
      insertItem.run({
        meeting_id: meetingId,
        description: item.description,
        assignee: item.assignee ?? null,
        priority: item.priority,
      })
    }
    return meetingId
  }
)
