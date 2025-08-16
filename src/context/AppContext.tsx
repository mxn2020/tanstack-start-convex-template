import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ConvexUser, Circle, Yalla, Challenge } from '../types';

interface AppState {
  user: ConvexUser | null;
  circles: Circle[];
  yallas: Yalla[];
  challenges: Challenge[];
  currentView: 'dashboard' | 'boards' | 'circles' | 'yallas' | 'profile';
}

type AppAction = 
  | { type: 'SET_USER'; payload: ConvexUser | null }
  | { type: 'ADD_CIRCLE'; payload: Circle }
  | { type: 'UPDATE_CIRCLE'; payload: Circle }
  | { type: 'DELETE_CIRCLE'; payload: string }
  | { type: 'ADD_YALLA'; payload: Yalla }
  | { type: 'UPDATE_YALLA'; payload: Yalla }
  | { type: 'DELETE_YALLA'; payload: string }
  | { type: 'SET_VIEW'; payload: AppState['currentView'] }
  | { type: 'VOTE_YALLA'; payload: { yallaId: string; userId: string; value: number } }
  | { type: 'UPDATE_KARMA'; payload: { userId: string; karmaLevel: number } }
  | { type: 'INCREMENT_TASKS_COMPLETED'; payload: string }
  | { type: 'INCREMENT_TASKS_ASSIGNED'; payload: string };

const initialState: AppState = {
  user: null,
  circles: [
    {
      id: '1',
      name: 'Family Circle',
      description: 'Family members and close relatives',
      color: '#FF6B35',
      members: [],
      adminId: '1',
      assignmentPermissions: 'all-members',
      createdAt: new Date(),
    },
    {
      id: '2',
      name: 'Work Squad',
      description: 'Colleagues and work friends',
      color: '#6366F1',
      members: [],
      adminId: '1',
      assignmentPermissions: 'admin-only',
      createdAt: new Date(),
    },
  ],
  yallas: [
    {
      id: '1',
      title: 'Organize weekend hiking trip',
      description: 'Plan route, book accommodation, check weather',
      type: 'community',
      creatorId: '1',
      circleId: '1',
      status: 'pending',
      votes: [{ id: '1', userId: '1', yallaId: '1', value: 1, createdAt: new Date() }],
      priority: 1,
      createdAt: new Date(),
    },
    {
      id: '2',
      title: 'Buy groceries for dinner party',
      description: 'Get ingredients for Mediterranean feast',
      type: 'assigned',
      creatorId: '1',
      circleId: '1',
      assignedTo: ['2'],
      status: 'accepted',
      votes: [],
      priority: 3,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    },
  ],
  challenges: [],
  currentView: 'boards', // Default to boards view for our Trello-like app
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'ADD_CIRCLE':
      return { ...state, circles: [...state.circles, action.payload] };
    case 'UPDATE_CIRCLE':
      return {
        ...state,
        circles: state.circles.map(circle =>
          circle.id === action.payload.id ? action.payload : circle
        ),
      };
    case 'DELETE_CIRCLE':
      return {
        ...state,
        circles: state.circles.filter(circle => circle.id !== action.payload),
      };
    case 'ADD_YALLA':
      return { ...state, yallas: [...state.yallas, action.payload] };
    case 'UPDATE_YALLA':
      return {
        ...state,
        yallas: state.yallas.map(yalla =>
          yalla.id === action.payload.id ? action.payload : yalla
        ),
      };
    case 'DELETE_YALLA':
      return {
        ...state,
        yallas: state.yallas.filter(yalla => yalla.id !== action.payload),
      };
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    case 'VOTE_YALLA':
      return {
        ...state,
        yallas: state.yallas.map(yalla => {
          if (yalla.id === action.payload.yallaId) {
            const existingVote = yalla.votes.find(v => v.userId === action.payload.userId);
            let newVotes;
            
            if (existingVote) {
              newVotes = yalla.votes.map(v =>
                v.userId === action.payload.userId
                  ? { ...v, value: action.payload.value }
                  : v
              );
            } else {
              newVotes = [
                ...yalla.votes,
                {
                  id: Date.now().toString(),
                  userId: action.payload.userId,
                  yallaId: action.payload.yallaId,
                  value: action.payload.value,
                  createdAt: new Date(),
                },
              ];
            }
            
            return { ...yalla, votes: newVotes };
          }
          return yalla;
        }),
      };
    case 'UPDATE_KARMA':
      return {
        ...state,
        user: state.user ? {
          ...state.user,
          karmaLevel: action.payload.karmaLevel
        } : null,
      };
    case 'INCREMENT_TASKS_COMPLETED':
      return {
        ...state,
        user: state.user && state.user.authUserId === action.payload ? {
          ...state.user,
          tasksCompleted: state.user.tasksCompleted + 1
        } : state.user,
      };
    case 'INCREMENT_TASKS_ASSIGNED':
      return {
        ...state,
        user: state.user && state.user.authUserId === action.payload ? {
          ...state.user,
          tasksAssigned: state.user.tasksAssigned + 1
        } : state.user,
      };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}