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

// Yalla types:

export interface Circle {
  id: string;
  name: string;
  description: string;
  color: string;
  members: ConvexUser[];
  adminId: string;
  assignmentPermissions: 'admin-only' | 'all-members';
  createdAt: Date;
}

export interface Yalla {
  id: string;
  title: string;
  description?: string;
  type: 'community' | 'assigned';
  creatorId: string;
  circleId: string;
  assignedTo?: string[];
  status: 'pending' | 'accepted' | 'completed' | 'declined';
  votes: Vote[];
  priority: number;
  dueDate?: Date;
  completedAt?: Date;
  completionImage?: string;
  createdAt: Date;
}

export interface Vote {
  id: string;
  userId: string;
  yallaId: string;
  value: number; // 1 for upvote, -1 for downvote
  createdAt: Date;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  circleId: string;
  participants: string[];
  deadline: Date;
  completedBy: string[];
  createdAt: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  currentView: 'login' | 'register' | 'forgot-password' | 'reset-password' | null;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'vote' | 'assignment' | 'completion' | 'invite' | 'achievement' | 'reminder';
  title: string;
  message: string;
  emoji: string;
  isRead: boolean;
  actionUrl?: string;
  entityType?: 'yalla' | 'circle' | 'user';
  entityId?: string;
  createdAt: Date;
  updatedAt: Date;
}

