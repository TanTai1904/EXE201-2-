import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from './AuthContext';

const CourseContext = createContext();

export function CourseProvider({ children }) {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [userProgress, setUserProgress] = useState({});

  useEffect(() => {
    const fetchCoursesAndProgress = async () => {
      try {
        const list = await api.get('/courses');
        
        let progress = {};
        if (user) {
          progress = await api.get('/courses/progress');
          setUserProgress(progress);
        } else {
          setUserProgress({});
        }

        // Merge initial progress into courses array for frontend ease of rendering
        const listWithProgress = list.map(c => {
          const prog = progress[c.id];
          return {
            ...c,
            progress: prog ? prog.progressPercent : 0
          };
        });

        setCourses(listWithProgress);
      } catch (error) {
        console.error('Error fetching courses and progress:', error);
      }
    };
    fetchCoursesAndProgress();
  }, [user]);

  const addCourse = async (newCourse) => {
    try {
      const freshCourse = await api.post('/courses/manage', newCourse);
      
      const formatted = {
        id: freshCourse.id,
        title: freshCourse.title,
        category: freshCourse.category,
        thumbnail: freshCourse.thumbnail,
        duration: freshCourse.duration,
        level: freshCourse.level,
        difficulty: freshCourse.difficulty,
        timeEstimated: freshCourse.timeEstimated,
        tags: freshCourse.tags ? JSON.parse(freshCourse.tags) : [],
        description: freshCourse.description,
        lessons: freshCourse.lessons ? JSON.parse(freshCourse.lessons) : [],
        quizzes: freshCourse.quizzes ? JSON.parse(freshCourse.quizzes) : [],
        progress: 0
      };

      setCourses(prev => [...prev, formatted]);
    } catch (error) {
      console.error('Failed to add course:', error);
    }
  };

  const updateCourse = async (updated) => {
    try {
      const res = await api.put(`/courses/manage/${updated.id}`, updated);
      
      const formatted = {
        id: res.id,
        title: res.title,
        category: res.category,
        thumbnail: res.thumbnail,
        duration: res.duration,
        level: res.level,
        difficulty: res.difficulty,
        timeEstimated: res.timeEstimated,
        tags: res.tags ? JSON.parse(res.tags) : [],
        description: res.description,
        lessons: res.lessons ? JSON.parse(res.lessons) : [],
        quizzes: res.quizzes ? JSON.parse(res.quizzes) : [],
        progress: courses.find(c => c.id === updated.id)?.progress || 0
      };

      setCourses(prev => prev.map(c => c.id === updated.id ? formatted : c));
    } catch (error) {
      console.error('Failed to update course:', error);
    }
  };

  const deleteCourse = async (id) => {
    try {
      await api.delete(`/courses/manage/${id}`);
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete course:', error);
    }
  };

  const recordLessonRead = async (courseId, lessonId) => {
    try {
      const progress = await api.post(`/courses/${courseId}/lessons/${lessonId}`);
      setUserProgress(prev => ({
        ...prev,
        [courseId]: {
          lessonsRead: progress.lessonsRead,
          quizCompleted: progress.quizCompleted,
          progressPercent: progress.progressPercent
        }
      }));

      // Update in courses list directly for simple display
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, progress: progress.progressPercent } : c));
    } catch (error) {
      console.error('Failed to record lesson read:', error);
    }
  };

  const completeCourseQuiz = async (courseId) => {
    try {
      const progress = await api.post(`/courses/${courseId}/quiz`);
      setUserProgress(prev => ({
        ...prev,
        [courseId]: {
          lessonsRead: progress.lessonsRead,
          quizCompleted: progress.quizCompleted,
          progressPercent: progress.progressPercent
        }
      }));

      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, progress: progress.progressPercent } : c));
    } catch (error) {
      console.error('Failed to complete course quiz:', error);
    }
  };

  const resetAllProgress = async () => {
    try {
      await api.post('/courses/reset-all');
      setUserProgress({});
      setCourses(prev => prev.map(c => ({ ...c, progress: 0 })));
    } catch (error) {
      console.error('Failed to reset all progress:', error);
    }
  };

  const resetCourseProgress = async (courseId) => {
    try {
      await api.post(`/courses/${courseId}/reset`);
      setUserProgress(prev => {
        const nextProg = { ...prev };
        delete nextProg[courseId];
        return nextProg;
      });
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, progress: 0 } : c));
    } catch (error) {
      console.error('Failed to reset course progress:', error);
    }
  };

  return (
    <CourseContext.Provider value={{
      courses,
      userProgress,
      addCourse,
      updateCourse,
      deleteCourse,
      recordLessonRead,
      completeCourseQuiz,
      setCourses,
      setUserProgress,
      resetAllProgress,
      resetCourseProgress
    }}>
      {children}
    </CourseContext.Provider>
  );
}

export function useCourses() {
  return useContext(CourseContext);
}
