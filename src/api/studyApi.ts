
// Mock API service for Study Buddy app
// This file simulates API calls and uses localStorage as a backend
// In a real application, these would be actual API endpoints

// Helper to generate unique IDs
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch courses from JSONPlaceholder (external API)
export const fetchCourses = async () => {
  try {
    // Using JSONPlaceholder for mock data
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    const users = await response.json();
    
    // Transform the users data into courses format
    return users.slice(0, 6).map((user: any) => ({
      id: user.id.toString(),
      name: `${user.name.split(' ')[0]}'s ${['Mathematics', 'Physics', 'Computer Science', 'Biology', 'History', 'Literature'][Math.floor(Math.random() * 6)]}`,
      instructor: user.name,
      code: `CS${100 + Math.floor(Math.random() * 400)}`
    }));
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw new Error('Failed to fetch courses');
  }
};

// API functions for assignments
export const fetchAssignments = async () => {
  await delay(500); // Simulate network delay
  const assignments = localStorage.getItem('assignments');
  return assignments ? JSON.parse(assignments) : [];
};

export const createAssignment = async (assignmentData: Omit<any, 'id'>) => {
  await delay(500);
  const newAssignment = {
    ...assignmentData,
    id: generateId(),
  };
  
  const assignments = await fetchAssignments();
  const updatedAssignments = [...assignments, newAssignment];
  localStorage.setItem('assignments', JSON.stringify(updatedAssignments));
  
  return newAssignment;
};

export const updateAssignment = async (id: string, assignmentData: any) => {
  await delay(500);
  const assignments = await fetchAssignments();
  const updatedAssignments = assignments.map((assignment: any) => 
    assignment.id === id ? { ...assignment, ...assignmentData } : assignment
  );
  
  localStorage.setItem('assignments', JSON.stringify(updatedAssignments));
  return updatedAssignments.find((a: any) => a.id === id);
};

export const deleteAssignment = async (id: string) => {
  await delay(500);
  const assignments = await fetchAssignments();
  const updatedAssignments = assignments.filter((assignment: any) => assignment.id !== id);
  localStorage.setItem('assignments', JSON.stringify(updatedAssignments));
  return { success: true, id };
};

// API functions for resources
export const fetchResources = async () => {
  await delay(500);
  const resources = localStorage.getItem('resources');
  return resources ? JSON.parse(resources) : [];
};

export const createResource = async (resourceData: Omit<any, 'id'>) => {
  await delay(500);
  const newResource = {
    ...resourceData,
    id: generateId(),
  };
  
  const resources = await fetchResources();
  const updatedResources = [...resources, newResource];
  localStorage.setItem('resources', JSON.stringify(updatedResources));
  
  return newResource;
};

export const deleteResource = async (id: string) => {
  await delay(500);
  const resources = await fetchResources();
  const updatedResources = resources.filter((resource: any) => resource.id !== id);
  localStorage.setItem('resources', JSON.stringify(updatedResources));
  return { success: true, id };
};

// API functions for notes
export const fetchNotes = async () => {
  await delay(500);
  const notes = localStorage.getItem('notes');
  return notes ? JSON.parse(notes) : [];
};

export const createNote = async (noteData: Omit<any, 'id' | 'createdAt' | 'updatedAt'>) => {
  await delay(500);
  const now = new Date().toISOString();
  const newNote = {
    ...noteData,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
  
  const notes = await fetchNotes();
  const updatedNotes = [...notes, newNote];
  localStorage.setItem('notes', JSON.stringify(updatedNotes));
  
  return newNote;
};

export const updateNote = async (id: string, noteData: any) => {
  await delay(500);
  const notes = await fetchNotes();
  const updatedNotes = notes.map((note: any) => 
    note.id === id 
      ? { 
          ...note, 
          ...noteData, 
          updatedAt: new Date().toISOString() 
        } 
      : note
  );
  
  localStorage.setItem('notes', JSON.stringify(updatedNotes));
  return updatedNotes.find((n: any) => n.id === id);
};

export const deleteNote = async (id: string) => {
  await delay(500);
  const notes = await fetchNotes();
  const updatedNotes = notes.filter((note: any) => note.id !== id);
  localStorage.setItem('notes', JSON.stringify(updatedNotes));
  return { success: true, id };
};

// API functions for study sessions
export const fetchStudySessions = async () => {
  await delay(500);
  const sessions = localStorage.getItem('studySessions');
  return sessions ? JSON.parse(sessions) : [];
};

export const createStudySession = async (sessionData: Omit<any, 'id'>) => {
  await delay(500);
  const newSession = {
    ...sessionData,
    id: generateId(),
  };
  
  const sessions = await fetchStudySessions();
  const updatedSessions = [...sessions, newSession];
  localStorage.setItem('studySessions', JSON.stringify(updatedSessions));
  
  return newSession;
};
