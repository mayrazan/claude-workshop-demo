// src/utils/storage.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { getMeetings, saveMeeting, deleteActionItem, updateActionItemStatus } from './storage'
import type { Meeting } from '../types'

const mockMeeting: Meeting = {
  id: 'meeting-1',
  title: 'Q1 Planning',
  submitter: 'Ana',
  createdAt: '2026-02-20T12:00:00.000Z',
  summary: 'Discussed Q1 goals.',
  actionItems: [
    {
      id: 'item-1',
      meetingId: 'meeting-1',
      meetingTitle: 'Q1 Planning',
      description: 'Write specs',
      responsible: 'Bob',
      priority: 'High',
      status: 'Pending',
      dueDate: '2026-03-01',
    },
  ],
}

beforeEach(() => {
  localStorage.clear()
})

describe('getMeetings', () => {
  it('returns empty array when nothing stored', () => {
    expect(getMeetings()).toEqual([])
  })

  it('returns stored meetings', () => {
    localStorage.setItem('meetings', JSON.stringify([mockMeeting]))
    expect(getMeetings()).toEqual([mockMeeting])
  })
})

describe('saveMeeting', () => {
  it('appends a meeting to the list', () => {
    saveMeeting(mockMeeting)
    expect(getMeetings()).toHaveLength(1)
    expect(getMeetings()[0].id).toBe('meeting-1')
  })

  it('preserves existing meetings when saving a new one', () => {
    saveMeeting(mockMeeting)
    const second = { ...mockMeeting, id: 'meeting-2' }
    saveMeeting(second)
    expect(getMeetings()).toHaveLength(2)
  })
})

describe('deleteActionItem', () => {
  it('removes an action item from its meeting', () => {
    saveMeeting(mockMeeting)
    deleteActionItem('meeting-1', 'item-1')
    const meetings = getMeetings()
    expect(meetings[0].actionItems).toHaveLength(0)
  })
})

describe('updateActionItemStatus', () => {
  it('updates the status of an action item', () => {
    saveMeeting(mockMeeting)
    updateActionItemStatus('meeting-1', 'item-1', 'Done')
    const meetings = getMeetings()
    expect(meetings[0].actionItems[0].status).toBe('Done')
  })
})
