// src/utils/storage.ts

import type { Meeting, ActionItem } from '../types';

const STORAGE_KEY = 'meetings';

export function loadMeetings(): Meeting[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Meeting[];
  } catch (e) {
    if (e instanceof SyntaxError) {
      console.warn('meetings localStorage data is malformed, resetting to []');
    }
    return [];
  }
}

export function saveMeetings(meetings: Meeting[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(meetings));
  } catch (e) {
    if (e instanceof DOMException) {
      throw new Error('Unable to save: storage is full or unavailable.');
    }
    throw e;
  }
}

export function addMeeting(meeting: Meeting): void {
  const meetings = loadMeetings();
  meetings.push(meeting);
  saveMeetings(meetings);
}

export function updateActionItem(meetingId: string, updated: ActionItem): void {
  const meetings = loadMeetings();
  const meeting = meetings.find((m) => m.id === meetingId);
  if (meeting) {
    meeting.actionItems = meeting.actionItems.map((item) =>
      item.id === updated.id ? updated : item
    );
    saveMeetings(meetings);
  }
}

export function deleteActionItem(meetingId: string, itemId: string): void {
  const meetings = loadMeetings();
  const meeting = meetings.find((m) => m.id === meetingId);
  if (meeting) {
    meeting.actionItems = meeting.actionItems.filter((item) => item.id !== itemId);
    saveMeetings(meetings);
  }
}

export function addActionItem(meetingId: string, item: ActionItem): void {
  const meetings = loadMeetings();
  const meeting = meetings.find((m) => m.id === meetingId);
  if (meeting) {
    meeting.actionItems.push(item);
    saveMeetings(meetings);
  }
}
