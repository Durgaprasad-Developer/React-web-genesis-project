
import React, { useState, useEffect } from 'react';
import { useStudyContext } from '../contexts/StudyContext';
import { Resource } from '../contexts/StudyContext';
import { fetchCourses } from '../api/studyApi';
import { BookOpen, File, Link, Plus, Trash, Video } from 'lucide-react';

const Resources = () => {
  const { state, dispatch } = useStudyContext();
  const [courses, setCourses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterCourse, setFilterCourse] = useState('');
  const [filterType, setFilterType] = useState('');
  const [formData, setFormData] = useState<Omit<Resource, 'id'>>({
    title: '',
    type: 'PDF',
    course: '',
    url: '',
    description: '',
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
    
    if (!formData.url.trim()) {
      newErrors.url = 'URL or file path is required';
    } else if (
      formData.url.trim().startsWith('http') && 
      !formData.url.match(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/)
    ) {
      newErrors.url = 'Please enter a valid URL';
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
    const newResource: Resource = {
      ...formData,
      id: Date.now().toString(),
    };
    
    dispatch({
      type: 'ADD_RESOURCE',
      payload: newResource,
    });
    
    // Reset form
    setFormData({
      title: '',
      type: 'PDF',
      course: '',
      url: '',
      description: '',
    });
    
    setShowForm(false);
  };

  const deleteResource = (id: string) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      dispatch({
        type: 'DELETE_RESOURCE',
        payload: id,
      });
    }
  };

  // Filter resources
  const filteredResources = state.resources.filter(resource => {
    if (filterCourse && resource.course !== filterCourse) return false;
    if (filterType && resource.type !== filterType) return false;
    return true;
  });

  // Get resource icon
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <File className="h-6 w-6 text-red-500" />;
      case 'Video':
        return <Video className="h-6 w-6 text-blue-500" />;
      case 'Article':
        return <BookOpen className="h-6 w-6 text-green-500" />;
      default:
        return <Link className="h-6 w-6 text-purple-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Resources</h1>
          <p className="text-gray-600">Manage your study materials and references</p>
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="mr-2 h-5 w-5" />
          {showForm ? 'Cancel' : 'Add Resource'}
        </button>
      </header>

      {/* Add Resource Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Add New Resource</h2>
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
                  placeholder="Resource title"
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
                  Resource Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="PDF">PDF</option>
                  <option value="Video">Video</option>
                  <option value="Article">Article</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL or File Path *
                </label>
                <input
                  type="text"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.url ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://example.com/resource"
                />
                {errors.url && (
                  <p className="text-red-500 text-xs mt-1">{errors.url}</p>
                )}
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
                placeholder="Brief description of the resource"
              ></textarea>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Add Resource
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <div>
          <label className="text-sm font-medium text-gray-700 mr-2">Filter by Course:</label>
          <select
            className="px-3 py-1 border border-gray-300 rounded-md"
            value={filterCourse}
            onChange={e => setFilterCourse(e.target.value)}
          >
            <option value="">All Courses</option>
            {courses.map(course => (
              <option key={course.id} value={course.name}>
                {course.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mr-2">Type:</label>
          <select
            className="px-3 py-1 border border-gray-300 rounded-md"
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="PDF">PDF</option>
            <option value="Video">Video</option>
            <option value="Article">Article</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Resources Grid */}
      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map(resource => (
            <div key={resource.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-100 p-2 rounded-full">
                      {getResourceIcon(resource.type)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{resource.title}</h3>
                      <p className="text-sm text-gray-500">{resource.course}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteResource(resource.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    aria-label="Delete resource"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
                {resource.description && (
                  <p className="text-sm text-gray-600 mt-3">{resource.description}</p>
                )}
                <div className="mt-4">
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                  >
                    <Link className="h-4 w-4 mr-1" />
                    Open Resource
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex justify-center mb-4">
            <BookOpen className="h-12 w-12 text-blue-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No resources found</h3>
          <p className="text-gray-600">
            {filterCourse || filterType 
              ? 'No resources match your current filters. Try changing the filters or add a new resource.'
              : 'Add your first resource to get started.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Resources;
