// src/types/index.ts

export interface Meeting {
  id: string;
  title: string;
  submitter: string;
  createdAt: string;         // ISO timestamp
  summary: string;           // AI-generated 2-3 sentence summary
  actionItems: ActionItem[];
}

export interface ActionItem {
  id: string;
  meetingId: string;
  meetingTitle: string;
  description: string;
  responsible: string;       // name or "Unassigned"
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Done';
  dueDate: string | null;    // ISO date string or null
}

export interface AISuccessResponse {
  success: true;
  meeting: {
    title: string;
    summary: string;
    discussionPoints: string[];
  };
  actionItems: Array<{
    description: string;
    responsible: string | null;
    priority: 'High' | 'Medium' | 'Low';
    dueDate: string | null;
  }>;
}

export interface AIErrorResponse {
  success: false;
  error: {
    code: 'INSUFFICIENT_INPUT' | 'PROCESSING_ERROR';
    message: string;
  };
}

export type AIResponse = AISuccessResponse | AIErrorResponse;
