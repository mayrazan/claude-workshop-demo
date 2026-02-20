export interface ActionItem {
  id?: number
  description: string
  assignee?: string | null
  priority: 'low' | 'medium' | 'high'
  status?: 'todo' | 'in-progress' | 'done'
}

export interface MeetingResponse {
  title: string
  summary: string
  action_items: ActionItem[]
}

// DisplayResult: used for both fresh-process results and hydrated DB state.
// summary is optional because it is not persisted — only available immediately after processing.
export interface DisplayResult {
  title: string
  summary?: string
  action_items: ActionItem[]
}

// Shape returned by GET /api/meetings/latest
export interface LatestMeetingResponse {
  meeting: {
    id: number
    title: string
    created_at: string
  }
  action_items: Array<{
    id: number
    meeting_id: number
    description: string
    assignee: string | null
    priority: 'low' | 'medium' | 'high'
    status: 'todo' | 'in-progress' | 'done'
    created_at: string
  }>
}
