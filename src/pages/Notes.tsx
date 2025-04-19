
import React, { useState, useEffect } from 'react';
import { useStudyContext } from '../contexts/StudyContext';
import { Note } from '../contexts/StudyContext';
import { fetchCourses } from '../api/studyApi';
import { FileText, Plus, Trash, Edit, Save, X } from 'lucide-react';

const Notes = () => {
  const { state, dispatch } = useStudyContext();
  const [courses, setCourses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterCourse, setFilterCourse] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>({
    title: '',
    content: '',
    course: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await fetchCourses();
        setCourses(data);
      } catch (err) {
        console.error(err);
      }
    };

    loadCourses();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.course) {
      newErrors.course = 'Course is required';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Note content is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const now = new Date().toISOString();
    
    if (editingNoteId) {
      // Update existing note
      const existingNote = state.notes.find(note => note.id === editingNoteId);
      if (existingNote) {
        const updatedNote: Note = {
          ...existingNote,
          ...formData,
          updatedAt: now,
        };
        
        dispatch({
          type: 'UPDATE_NOTE',
          payload: updatedNote,
        });
      }
    } else {
      // Create new note
      const newNote: Note = {
        ...formData,
        id: Date.now().toString(),
        createdAt: now,
        updatedAt: now,
      };
      
      dispatch({
        type: 'ADD_NOTE',
        payload: newNote,
      });
    }
    
    // Reset form
    setFormData({
      title: '',
      content: '',
      course: '',
    });
    
    setEditingNoteId(null);
    setShowForm(false);
  };

  const startEditingNote = (note: Note) => {
    setFormData({
      title: note.title,
      content: note.content,
      course: note.course,
    });
    
    setEditingNoteId(note.id);
    setShowForm(true);
  };

  const cancelEdit = () => {
    setFormData({
      title: '',
      content: '',
      course: '',
    });
    
    setEditingNoteId(null);
    setShowForm(false);
  };

  const deleteNote = (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      dispatch({
        type: 'DELETE_NOTE',
        payload: id,
      });
    }
  };

  // Filter and search notes
  const filteredNotes = state.notes.filter(note => {
    const matchesCourse = !filterCourse || note.course === filterCourse;
    const matchesSearch = !searchTerm || 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCourse && matchesSearch;
  });

  // Format date function
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notes</h1>
          <p className="text-gray-600">Capture and organize your study notes</p>
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
          onClick={() => {
            if (showForm && editingNoteId) {
              cancelEdit();
            } else {
              setShowForm(!showForm);
            }
          }}
        >
          {showForm && !editingNoteId ? (
            <>
              <X className="mr-2 h-5 w-5" />
              Cancel
            </>
          ) : showForm && editingNoteId ? (
            <>
              <X className="mr-2 h-5 w-5" />
              Cancel Edit
            </>
          ) : (
            <>
              <Plus className="mr-2 h-5 w-5" />
              Add Note
            </>
          )}
        </button>
      </header>

      {/* Add/Edit Note Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingNoteId ? 'Edit Note' : 'Add New Note'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Note title"
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course *
                </label>
                <select
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.course ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.name}>
                      {course.name}
                    </option>
                  ))}
                </select>
                {errors.course && (
                  <p className="text-red-500 text-xs mt-1">{errors.course}</p>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.content ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={8}
                placeholder="Write your note here..."
              ></textarea>
              {errors.content && (
                <p className="text-red-500 text-xs mt-1">{errors.content}</p>
              )}
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={cancelEdit}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
              >
                <Save className="mr-2 h-4 w-4" />
                {editingNoteId ? 'Update Note' : 'Save Note'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Search Notes
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Search by title or content..."
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Filter by Course
          </label>
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All Courses</option>
            {courses.map(course => (
              <option key={course.id} value={course.name}>
                {course.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes List */}
      {filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredNotes.map(note => (
            <div key={note.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-800 text-lg">{note.title}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEditingNote(note)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      aria-label="Edit note"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      aria-label="Delete note"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <FileText className="h-4 w-4 mr-1" />
                  <span>{note.course}</span>
                  <span className="mx-2">•</span>
                  <span>Updated {formatDate(note.updatedAt)}</span>
                </div>
                
                <div className="text-gray-600 overflow-hidden max-h-40">
                  {/* Show the content with line breaks preserved */}
                  {note.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-1">
                      {paragraph}
                    </p>
                  ))}
                </div>
                
                {note.content.length > 200 && (
                  <button
                    onClick={() => startEditingNote(note)}
                    className="text-blue-600 hover:text-blue-800 text-sm mt-2"
                  >
                    Read more
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex justify-center mb-4">
            <FileText className="h-12 w-12 text-blue-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No notes found</h3>
          <p className="text-gray-600">
            {filterCourse || searchTerm 
              ? 'No notes match your current filters. Try changing the filters or add a new note.'
              : 'Add your first note to get started.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Notes;
