import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Types
export interface Assignment {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High';
  completed: boolean;
  description: string;
}

export interface Resource {
  id: string;
  title: string;
  type: 'PDF' | 'Video' | 'Article' | 'Other';
  course: string;
  url: string;
  description: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  course: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudySession {
  id: string;
  course: string;
  duration: number; // in minutes
  date: string;
}

export interface Course {
  id: string;
  name: string;
  createdAt: string;
}

interface StudyState {
  assignments: Assignment[];
  resources: Resource[];
  notes: Note[];
  studySessions: StudySession[];
  courses: Course[];
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: StudyState = {
  assignments: [],
  resources: [],
  notes: [],
  studySessions: [],
  courses: [],
  isLoading: false,
  error: null,
};

// Action types
type ActionType =
  | { type: 'FETCH_DATA_START' }
  | { type: 'FETCH_DATA_SUCCESS'; payload: Partial<StudyState> }
  | { type: 'FETCH_DATA_ERROR'; payload: string }
  | { type: 'ADD_ASSIGNMENT'; payload: Assignment }
  | { type: 'UPDATE_ASSIGNMENT'; payload: Assignment }
  | { type: 'DELETE_ASSIGNMENT'; payload: string }
  | { type: 'ADD_RESOURCE'; payload: Resource }
  | { type: 'DELETE_RESOURCE'; payload: string }
  | { type: 'ADD_NOTE'; payload: Note }
  | { type: 'UPDATE_NOTE'; payload: Note }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'ADD_STUDY_SESSION'; payload: StudySession }
  | { type: 'ADD_COURSE'; payload: Course }
  | { type: 'DELETE_COURSE'; payload: string };

// Reducer function
const studyReducer = (state: StudyState, action: ActionType): StudyState => {
  switch (action.type) {
    case 'FETCH_DATA_START':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_DATA_SUCCESS':
      return { ...state, ...action.payload, isLoading: false };
    case 'FETCH_DATA_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'ADD_ASSIGNMENT':
      return {
        ...state,
        assignments: [...state.assignments, action.payload],
      };
    case 'UPDATE_ASSIGNMENT':
      return {
        ...state,
        assignments: state.assignments.map((assignment) =>
          assignment.id === action.payload.id ? action.payload : assignment
        ),
      };
    case 'DELETE_ASSIGNMENT':
      return {
        ...state,
        assignments: state.assignments.filter(
          (assignment) => assignment.id !== action.payload
        ),
      };
    case 'ADD_RESOURCE':
      return {
        ...state,
        resources: [...state.resources, action.payload],
      };
    case 'DELETE_RESOURCE':
      return {
        ...state,
        resources: state.resources.filter(
          (resource) => resource.id !== action.payload
        ),
      };
    case 'ADD_NOTE':
      return {
        ...state,
        notes: [...state.notes, action.payload],
      };
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map((note) =>
          note.id === action.payload.id ? action.payload : note
        ),
      };
    case 'DELETE_NOTE':
      return {
        ...state,
        notes: state.notes.filter((note) => note.id !== action.payload),
      };
    case 'ADD_STUDY_SESSION':
      return {
        ...state,
        studySessions: [...state.studySessions, action.payload],
      };
    case 'ADD_COURSE':
      return {
        ...state,
        courses: [...state.courses, action.payload],
      };
    case 'DELETE_COURSE':
      return {
        ...state,
        courses: state.courses.filter((course) => course.id !== action.payload),
      };
    default:
      return state;
  }
};

// Create context
const StudyContext = createContext<{
  state: StudyState;
  dispatch: React.Dispatch<ActionType>;
}>({
  state: initialState,
  dispatch: () => null,
});

// Custom hook to use the study context
export const useStudyContext = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudyContext must be used within a StudyProvider');
  }
  return context;
};

// Provider component
export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(studyReducer, initialState);

  // Load data from local storage on initial render
  useEffect(() => {
    const loadDataFromLocalStorage = () => {
      try {
        dispatch({ type: 'FETCH_DATA_START' });
        
        const storedAssignments = localStorage.getItem('assignments');
        const storedResources = localStorage.getItem('resources');
        const storedNotes = localStorage.getItem('notes');
        const storedSessions = localStorage.getItem('studySessions');
        const storedCourses = localStorage.getItem('courses');
        
        const payload: Partial<StudyState> = {};
        
        if (storedAssignments) {
          payload.assignments = JSON.parse(storedAssignments);
        }
        
        if (storedResources) {
          payload.resources = JSON.parse(storedResources);
        }
        
        if (storedNotes) {
          payload.notes = JSON.parse(storedNotes);
        }
        
        if (storedSessions) {
          payload.studySessions = JSON.parse(storedSessions);
        }
        
        if (storedCourses) {
          payload.courses = JSON.parse(storedCourses);
        }
        
        dispatch({ type: 'FETCH_DATA_SUCCESS', payload });
      } catch (error) {
        dispatch({ 
          type: 'FETCH_DATA_ERROR', 
          payload: 'Failed to load data from local storage' 
        });
      }
    };

    loadDataFromLocalStorage();
  }, []);

  // Save data to local storage whenever state changes
  useEffect(() => {
    localStorage.setItem('assignments', JSON.stringify(state.assignments));
    localStorage.setItem('resources', JSON.stringify(state.resources));
    localStorage.setItem('notes', JSON.stringify(state.notes));
    localStorage.setItem('studySessions', JSON.stringify(state.studySessions));
    localStorage.setItem('courses', JSON.stringify(state.courses));
  }, [state.assignments, state.resources, state.notes, state.studySessions, state.courses]);

  return (
    <StudyContext.Provider value={{ state, dispatch }}>
      {children}
    </StudyContext.Provider>
  );
};
