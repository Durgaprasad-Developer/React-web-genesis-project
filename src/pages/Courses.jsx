
import React, { useState } from 'react';
import { useStudyContext } from '../contexts/StudyContext';
import { Plus, Trash } from 'lucide-react';

const Courses = () => {
  const { state, dispatch } = useStudyContext();
  const [newCourseName, setNewCourseName] = useState('');
  const [error, setError] = useState('');

  const handleAddCourse = (e) => {
    e.preventDefault();
    
    if (!newCourseName.trim()) {
      setError('Course name is required');
      return;
    }

    // Check for duplicate course names
    if (state.courses.some(course => course.name.toLowerCase() === newCourseName.toLowerCase())) {
      setError('A course with this name already exists');
      return;
    }

    const newCourse = {
      id: Date.now().toString(),
      name: newCourseName.trim(),
      createdAt: new Date().toISOString(),
    };

    dispatch({
      type: 'ADD_COURSE',
      payload: newCourse,
    });

    setNewCourseName('');
    setError('');
  };

  const handleDeleteCourse = (courseId) => {
    if (window.confirm('Are you sure you want to delete this course? This will not affect existing assignments and notes.')) {
      dispatch({
        type: 'DELETE_COURSE',
        payload: courseId,
      });
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-800">Courses</h1>
        <p className="text-gray-600">Manage your courses</p>
      </header>

      {/* Add Course Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleAddCourse} className="space-y-4">
          <div>
            <label htmlFor="courseName" className="block text-sm font-medium text-gray-700">
              Course Name
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                id="courseName"
                value={newCourseName}
                onChange={(e) => {
                  setNewCourseName(e.target.value);
                  setError('');
                }}
                className="flex-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter course name"
              />
              <button
                type="submit"
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-5 w-5 mr-1" />
                Add Course
              </button>
            </div>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        </form>
      </div>

      {/* Courses List */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {state.courses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center"
          >
            <div>
              <h3 className="font-medium text-gray-900">{course.name}</h3>
              <p className="text-sm text-gray-500">
                Added {new Date(course.createdAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => handleDeleteCourse(course.id)}
              className="text-red-500 hover:text-red-700 p-2"
              aria-label="Delete course"
            >
              <Trash className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>

      {state.courses.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <h3 className="mt-2 text-sm font-medium text-gray-900">No courses</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding a new course.</p>
        </div>
      )}
    </div>
  );
};

export default Courses;
