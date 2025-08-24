export interface ConvexUser {
  authUserId: string;
  email: string;
  name?: string;
  avatar?: string;
  karmaLevel: number;
  tasksCompleted: number;
  tasksAssigned: number;
}

export interface RenderedItem {
  id: string
  title: string
  order: number
  content?: string
  columnId: string
}

export const CONTENT_TYPES = {
  card: 'application/app-card',
  column: 'application/app-column',
}

export const INTENTS = {
  updateColumnName: 'updateColumnName' as const,
  updateBoardName: 'updateBoardName' as const,
}

export const ItemMutationFields = {
  id: { type: String, name: 'id' },
  columnId: { type: String, name: 'columnId' },
  order: { type: Number, name: 'order' },
  title: { type: String, name: 'title' },
} as const


export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  currentView: 'login' | 'register' | 'forgot-password' | 'reset-password' | null;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'assignment' | 'completion' | 'invite' | 'achievement' | 'reminder';
  title: string;
  message: string;
  emoji: string;
  isRead: boolean;
  actionUrl?: string;
  entityType?: 'board' | 'item' | 'user';
  entityId?: string;
  createdAt: Date;
  updatedAt: Date;
}

