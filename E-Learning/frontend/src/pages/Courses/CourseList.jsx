import React, { useState, useEffect } from 'react';
import { courseService } from '../../services/courseService';
import Card from '../../components/common/Card';
import Loading from '../../components/Loading';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await courseService.getAllCourses();
      setCourses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="course-list-container">
      <h1>Browse Courses</h1>
      <div className="courses-grid">
        {courses.map(course => (
          <Card key={course.id} className="course-card">
            <h3>{course.name}</h3>
            <p>{course.description}</p>
            <p className="difficulty">{course.difficultyLevel}</p>
            <button className="btn btn-primary">View Course</button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CourseList;
