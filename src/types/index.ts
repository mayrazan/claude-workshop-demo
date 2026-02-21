// src/types/index.ts

export interface Meeting {
  id: string;
  title: string;
  submitter: string;
  createdAt: string;
  actionItems: ActionItem[];
}

export interface ActionItem {
  id: string;
  meetingId: string;
  meetingTitle: string;
  description: string;
  responsible: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Done';
  dueDate: string | null;
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
