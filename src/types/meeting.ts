export interface ActionItem {
  description: string
  assignee?: string
  priority: 'low' | 'medium' | 'high'
}

export interface MeetingResponse {
  summary: string
  action_items: ActionItem[]
}
