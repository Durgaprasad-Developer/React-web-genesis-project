
import React, { useEffect, useState } from 'react';
import { useStudyContext } from '../contexts/StudyContext';
import { fetchCourses } from '../api/studyApi';
import { BookOpen, Calendar, Check, Clock, FileText } from 'lucide-react';

const Dashboard = () => {
  const { state } = useStudyContext();
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setIsLoading(true);
        const data = await fetchCourses();
        setCourses(data);
      } catch (err) {
        setError('Failed to load courses');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCourses();
  }, []);

  // Calculate stats
  const pendingAssignments = state.assignments.filter(a => !a.completed).length;
  const totalStudyTime = state.studySessions.reduce((total, session) => total + session.duration, 0);
  const totalNotes = state.notes.length;
  const resourcesCount = state.resources.length;
  
  // Get upcoming assignments (next 7 days)
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  
  const upcomingAssignments = state.assignments
    .filter(assignment => {
      const dueDate = new Date(assignment.dueDate);
      return dueDate >= today && dueDate <= nextWeek && !assignment.completed;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  // Format date function
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome to your Study Buddy dashboard</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Calendar className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Pending Assignments</h2>
              <p className="text-2xl font-bold text-gray-800">{pendingAssignments}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-full">
              <Clock className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Total Study Time</h2>
              <p className="text-2xl font-bold text-gray-800">{totalStudyTime} mins</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded-full">
              <FileText className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Total Notes</h2>
              <p className="text-2xl font-bold text-gray-800">{totalNotes}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 p-2 rounded-full">
              <BookOpen className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Resources</h2>
              <p className="text-2xl font-bold text-gray-800">{resourcesCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Assignments */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Assignments</h2>
          {upcomingAssignments.length > 0 ? (
            <ul className="space-y-4">
              {upcomingAssignments.map(assignment => (
                <li key={assignment.id} className="flex items-start">
                  <div className={`p-2 rounded-full mr-3 ${
                    assignment.priority === 'High' 
                      ? 'bg-red-100' 
                      : assignment.priority === 'Medium'
                        ? 'bg-yellow-100'
                        : 'bg-green-100'
                  }`}>
                    <Calendar className={`h-5 w-5 ${
                      assignment.priority === 'High' 
                        ? 'text-red-500' 
                        : assignment.priority === 'Medium'
                          ? 'text-yellow-500'
                          : 'text-green-500'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{assignment.title}</h3>
                    <p className="text-sm text-gray-500">
                      {assignment.course} • Due {formatDate(assignment.dueDate)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-4">No upcoming assignments</p>
          )}
          <div className="mt-4">
            <a href="/assignments" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View all assignments →
            </a>
          </div>
        </div>

        {/* Courses */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Courses</h2>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : courses.length > 0 ? (
            <ul className="space-y-3">
              {courses.map(course => (
                <li key={course.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <h3 className="font-medium text-gray-800">{course.name}</h3>
                  <p className="text-sm text-gray-500">
                    {course.code} • {course.instructor}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-4">No courses found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
