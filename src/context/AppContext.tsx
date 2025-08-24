import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ConvexUser } from '../types';

interface AppState {
  user: ConvexUser | null;
  currentView: 'dashboard' | 'boards' | 'profile';
}

type AppAction = 
  | { type: 'SET_USER'; payload: ConvexUser | null }
  | { type: 'SET_VIEW'; payload: AppState['currentView'] }
  | { type: 'UPDATE_KARMA'; payload: { userId: string; karmaLevel: number } }
  | { type: 'INCREMENT_TASKS_COMPLETED'; payload: string }
  | { type: 'INCREMENT_TASKS_ASSIGNED'; payload: string };

const initialState: AppState = {
  user: null,
  currentView: 'boards', // Default to boards view for our task management app
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
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