// src/utils/storage.ts
import type { Meeting, ActionItem } from '../types'

const STORAGE_KEY = 'meetings'

export function getMeetings(): Meeting[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Meeting[]) : []
  } catch {
    return []
  }
}

export function saveMeeting(meeting: Meeting): void {
  const meetings = getMeetings()
  meetings.push(meeting)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meetings))
}

export function deleteActionItem(meetingId: string, actionItemId: string): void {
  const meetings = getMeetings()
  const updated = meetings.map((m) =>
    m.id === meetingId
      ? { ...m, actionItems: m.actionItems.filter((a) => a.id !== actionItemId) }
      : m
  )
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export function updateActionItemStatus(
  meetingId: string,
  actionItemId: string,
  status: ActionItem['status']
): void {
  const meetings = getMeetings()
  const updated = meetings.map((m) =>
    m.id === meetingId
      ? {
          ...m,
          actionItems: m.actionItems.map((a) =>
            a.id === actionItemId ? { ...a, status } : a
          ),
        }
      : m
  )
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export function updateActionItem(
  meetingId: string,
  actionItemId: string,
  changes: Partial<Pick<ActionItem, 'description' | 'responsible' | 'priority' | 'dueDate'>>
): void {
  const meetings = getMeetings()
  const updated = meetings.map((m) =>
    m.id === meetingId
      ? {
          ...m,
          actionItems: m.actionItems.map((a) =>
            a.id === actionItemId ? { ...a, ...changes } : a
          ),
        }
      : m
  )
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}
