export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export interface ChecklistItem {
  title: string;
  isCompleted: boolean;
}

export type TaskStatus = string;
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Subtask {
  _id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate?: string;
  dueDate?: string;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  color: string;
  status: 'ACTIVE' | 'COMPLETED';
  completedAt?: string;
  order?: number;
  createdAt?: string;
}

export interface Task {
  _id: string;
  id?: string;
  title: string;
  content?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: User | null;
  checklist?: ChecklistItem[];
  subtasks?: Subtask[];
  order?: number;
  startDate?: string;
  dueDate?: string;
  projectId?: string;
}
