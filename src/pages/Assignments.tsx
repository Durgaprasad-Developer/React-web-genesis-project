
import React, { useState, useEffect } from 'react';
import { useStudyContext } from '../contexts/StudyContext';
import { Assignment } from '../contexts/StudyContext';
import { fetchCourses } from '../api/studyApi';
import { Check, Plus, Trash, Calendar, AlertTriangle } from 'lucide-react';

const Assignments = () => {
  const { state, dispatch } = useStudyContext();
  const [courses, setCourses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Omit<Assignment, 'id'>>({
    title: '',
    course: '',
    dueDate: '',
    priority: 'Medium',
    completed: false,
    description: '',
  });
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
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
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else {
      // Check if due date is in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(formData.dueDate);
      
      if (dueDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Generate a unique ID
    const newAssignment: Assignment = {
      ...formData,
      id: Date.now().toString(),
    };
    
    dispatch({
      type: 'ADD_ASSIGNMENT',
      payload: newAssignment,
    });
    
    // Reset form
    setFormData({
      title: '',
      course: '',
      dueDate: '',
      priority: 'Medium',
      completed: false,
      description: '',
    });
    
    setShowForm(false);
  };

  const toggleAssignmentCompletion = (id: string, completed: boolean) => {
    const assignment = state.assignments.find(a => a.id === id);
    if (assignment) {
      dispatch({
        type: 'UPDATE_ASSIGNMENT',
        payload: { ...assignment, completed: !completed },
      });
    }
  };

  const deleteAssignment = (id: string) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      dispatch({
        type: 'DELETE_ASSIGNMENT',
        payload: id,
      });
    }
  };

  // Filter and sort assignments
  const filteredAssignments = state.assignments.filter(assignment => {
    if (filter === 'all') return true;
    if (filter === 'completed') return assignment.completed;
    if (filter === 'pending') return !assignment.completed;
    return true;
  });

  const sortedAssignments = [...filteredAssignments].sort((a, b) => {
    if (sortBy === 'dueDate') {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (sortBy === 'priority') {
      const priorityValues = { 'Low': 0, 'Medium': 1, 'High': 2 };
      return priorityValues[b.priority] - priorityValues[a.priority];
    }
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  // Format date function
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Assignments</h1>
          <p className="text-gray-600">Manage your assignments and deadlines</p>
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="mr-2 h-5 w-5" />
          {showForm ? 'Cancel' : 'Add Assignment'}
        </button>
      </header>

      {/* Add Assignment Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Add New Assignment</h2>
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
                  placeholder="Assignment title"
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.dueDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.dueDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Provide details about the assignment"
              ></textarea>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Add Assignment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Sort Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <div>
          <label className="text-sm font-medium text-gray-700 mr-2">Status:</label>
          <select
            className="px-3 py-1 border border-gray-300 rounded-md"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mr-2">Sort by:</label>
          <select
            className="px-3 py-1 border border-gray-300 rounded-md"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="title">Title</option>
          </select>
        </div>
      </div>

      {/* Assignments List */}
      {sortedAssignments.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {sortedAssignments.map(assignment => (
              <li key={assignment.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <button 
                      onClick={() => toggleAssignmentCompletion(assignment.id, assignment.completed)}
                      className={`mt-1 p-1 rounded-full ${
                        assignment.completed 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Check className="h-5 w-5" />
                    </button>
                    
                    <div>
                      <h3 className={`font-medium ${
                        assignment.completed ? 'text-gray-500 line-through' : 'text-gray-800'
                      }`}>
                        {assignment.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {assignment.course} • Due {formatDate(assignment.dueDate)}
                      </p>
                      {assignment.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {assignment.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      assignment.priority === 'High' 
                        ? 'bg-red-100 text-red-800' 
                        : assignment.priority === 'Medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {assignment.priority}
                    </span>
                    
                    <button 
                      onClick={() => deleteAssignment(assignment.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      aria-label="Delete assignment"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex justify-center mb-4">
            <Calendar className="h-12 w-12 text-blue-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No assignments found</h3>
          <p className="text-gray-600">
            {filter !== 'all' 
              ? `There are no ${filter} assignments. Try changing the filter.` 
              : 'Add your first assignment to get started.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Assignments;
