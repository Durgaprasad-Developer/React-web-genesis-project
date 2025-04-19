
import React, { useState, useEffect } from 'react';
import { useStudyContext } from '../contexts/StudyContext';
import { StudySession } from '../contexts/StudyContext';
import { fetchCourses } from '../api/studyApi';
import { Clock, Play, Pause, RotateCcw, Check, BarChart } from 'lucide-react';

const StudyTimer = () => {
  const { state, dispatch } = useStudyContext();
  const [courses, setCourses] = useState<any[]>([]);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'pomodoro' | 'shortBreak' | 'longBreak'>('pomodoro');
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [showStats, setShowStats] = useState(false);

  // Timer durations
  const timerModes = {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
  };

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await fetchCourses();
        setCourses(data);
        if (data.length > 0) {
          setSelectedCourse(data[0].name);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadCourses();
  }, []);

  useEffect(() => {
    let interval: number | undefined;

    if (isActive) {
      interval = window.setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          // Timer completed
          clearInterval(interval);
          handleTimerComplete();
        }
      }, 1000);
    } else if (!isActive && interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, minutes, seconds]);

  const handleTimerComplete = () => {
    // Play a sound
    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-bell-notification-933.mp3');
    audio.play().catch(error => console.error('Error playing sound:', error));
    
    // Show browser notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Study Timer', {
        body: mode === 'pomodoro' ? 'Time for a break!' : 'Back to work!',
        icon: '/favicon.ico'
      });
    }

    // Reset the timer
    setIsActive(false);
    
    if (mode === 'pomodoro') {
      // Track completed session
      if (selectedCourse) {
        const newSession: StudySession = {
          id: Date.now().toString(),
          course: selectedCourse,
          duration: timerModes.pomodoro,
          date: new Date().toISOString(),
        };
        
        dispatch({
          type: 'ADD_STUDY_SESSION',
          payload: newSession,
        });
      }
      
      // Update completed pomodoros
      const newCount = completedPomodoros + 1;
      setCompletedPomodoros(newCount);
      
      // After 4 pomodoros, take a long break
      if (newCount % 4 === 0) {
        setMode('longBreak');
        setMinutes(timerModes.longBreak);
      } else {
        setMode('shortBreak');
        setMinutes(timerModes.shortBreak);
      }
    } else {
      // After a break, go back to pomodoro
      setMode('pomodoro');
      setMinutes(timerModes.pomodoro);
    }
    
    setSeconds(0);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(timerModes[mode]);
    setSeconds(0);
  };

  const switchMode = (newMode: 'pomodoro' | 'shortBreak' | 'longBreak') => {
    setIsActive(false);
    setMode(newMode);
    setMinutes(timerModes[newMode]);
    setSeconds(0);
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  };

  // Format time display
  const formatTime = (mins: number, secs: number) => {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate study statistics
  const calculateStats = () => {
    // Total study time in minutes
    const totalTime = state.studySessions.reduce((total, session) => total + session.duration, 0);
    
    // Study time by course
    const courseTimeMap = new Map<string, number>();
    state.studySessions.forEach(session => {
      const current = courseTimeMap.get(session.course) || 0;
      courseTimeMap.set(session.course, current + session.duration);
    });
    
    // Sort by most studied
    const courseStats = Array.from(courseTimeMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([course, time]) => ({ course, time }));
    
    // Study sessions by day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);
    lastWeek.setHours(0, 0, 0, 0);
    
    const todaySessions = state.studySessions.filter(session => 
      new Date(session.date) >= today
    );
    
    const weekSessions = state.studySessions.filter(session => 
      new Date(session.date) >= lastWeek
    );
    
    return {
      totalTime,
      courseStats,
      todayMinutes: todaySessions.reduce((total, session) => total + session.duration, 0),
      weekMinutes: weekSessions.reduce((total, session) => total + session.duration, 0),
      sessionsCount: state.studySessions.length,
    };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Study Timer</h1>
          <p className="text-gray-600">Focus on your work with the Pomodoro technique</p>
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
          onClick={() => setShowStats(!showStats)}
        >
          <BarChart className="mr-2 h-5 w-5" />
          {showStats ? 'Hide Stats' : 'Show Stats'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timer Section */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
          {/* Mode Selector */}
          <div className="flex space-x-2 mb-6">
            <button
              className={`px-4 py-2 rounded-md ${
                mode === 'pomodoro' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => switchMode('pomodoro')}
            >
              Pomodoro
            </button>
            <button
              className={`px-4 py-2 rounded-md ${
                mode === 'shortBreak' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => switchMode('shortBreak')}
            >
              Short Break
            </button>
            <button
              className={`px-4 py-2 rounded-md ${
                mode === 'longBreak' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => switchMode('longBreak')}
            >
              Long Break
            </button>
          </div>
          
          {/* Timer Display */}
          <div className={`w-64 h-64 rounded-full flex items-center justify-center border-8 ${
            mode === 'pomodoro' 
              ? 'border-blue-500' 
              : mode === 'shortBreak'
                ? 'border-green-500'
                : 'border-purple-500'
          }`}>
            <h2 className="text-5xl font-bold text-gray-800">
              {formatTime(minutes, seconds)}
            </h2>
          </div>
          
          {/* Controls */}
          <div className="flex space-x-4 mt-6">
            <button
              className={`p-3 rounded-full ${
                mode === 'pomodoro' 
                  ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                  : mode === 'shortBreak'
                    ? 'bg-green-100 text-green-600 hover:bg-green-200'
                    : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
              }`}
              onClick={toggleTimer}
              aria-label={isActive ? 'Pause timer' : 'Start timer'}
            >
              {isActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </button>
            <button
              className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
              onClick={resetTimer}
              aria-label="Reset timer"
            >
              <RotateCcw className="h-6 w-6" />
            </button>
          </div>
          
          {/* Pomodoro Counter */}
          <div className="mt-6 flex items-center">
            <span className="text-sm text-gray-600 mr-2">Completed sessions:</span>
            <div className="flex space-x-1">
              {[...Array(4)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-3 h-3 rounded-full ${
                    i < (completedPomodoros % 4) ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                ></div>
              ))}
            </div>
            <span className="text-sm ml-2 text-gray-600">
              {Math.floor(completedPomodoros / 4)} sets
            </span>
          </div>
          
          {/* Course Selection for Tracking */}
          {mode === 'pomodoro' && (
            <div className="mt-6 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Course to Track
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {courses.map(course => (
                  <option key={course.id} value={course.name}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Notification Permission */}
          <button
            className="mt-4 text-sm text-blue-600 hover:text-blue-800"
            onClick={requestNotificationPermission}
          >
            Enable notifications
          </button>
        </div>

        {/* Stats Section */}
        {showStats ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Your Study Statistics
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Total Study Time</p>
                  <p className="text-xl font-bold text-gray-800">
                    {Math.floor(stats.totalTime / 60)} hours {stats.totalTime % 60} mins
                  </p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Total Sessions</p>
                  <p className="text-xl font-bold text-gray-800">
                    {stats.sessionsCount}
                  </p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Today's Study Time</p>
                  <p className="text-xl font-bold text-gray-800">
                    {stats.todayMinutes} mins
                  </p>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">This Week's Study Time</p>
                  <p className="text-xl font-bold text-gray-800">
                    {stats.weekMinutes} mins
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-gray-800 mb-2">Study Time by Course</h3>
                {stats.courseStats.length > 0 ? (
                  <ul className="space-y-3">
                    {stats.courseStats.map(({ course, time }) => (
                      <li key={course} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{course}</span>
                          <span className="text-gray-600">
                            {Math.floor(time / 60) > 0 ? `${Math.floor(time / 60)}h ` : ''}
                            {time % 60}m
                          </span>
                        </div>
                        <div className="mt-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(time / stats.totalTime) * 100}%` }}
                          ></div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-center py-4">No study sessions recorded yet</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              About the Pomodoro Technique
            </h2>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                The Pomodoro Technique is a time management method developed by Francesco Cirillo 
                in the late 1980s. It uses a timer to break work into intervals, traditionally 
                25 minutes in length, separated by short breaks.
              </p>
              
              <h3 className="font-medium text-gray-800">Basic Process:</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>Choose a task to work on</li>
                <li>Set the timer for 25 minutes (a "pomodoro")</li>
                <li>Work on the task until the timer rings</li>
                <li>Take a short 5-minute break</li>
                <li>After 4 pomodoros, take a longer 15-30 minute break</li>
              </ol>
              
              <h3 className="font-medium text-gray-800">Benefits:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Reduces distractions and mental fatigue</li>
                <li>Increases accountability and motivation</li>
                <li>Improves work quality through regular breaks</li>
                <li>Creates a consistent rhythm for productivity</li>
                <li>Helps track time spent on different tasks</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyTimer;
