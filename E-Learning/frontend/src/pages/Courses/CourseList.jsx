import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseService } from '../../services/courseService';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Loading from '../../components/Loading';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [universities, setUniversities] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState('');

  useEffect(() => { fetchUniversities(); fetchCourses(); }, []);

  const fetchCourses = async (universityId = null) => {
    try {
      setLoading(true);
      const filters = {};
      if (universityId) filters.universityId = universityId;
      const data = await courseService.getAllCourses(1, 20, filters);
      // backend may return an object or array depending on endpoint; normalize
      const list = Array.isArray(data) ? data : (data?.items || data?.courses || []);
      if (!list || list.length === 0) {
        console.warn('No courses returned from /courses, trying /courses/new and /courses/popular as fallback');
        const newCourses = await courseService.getNewCourses();
        const popular = await courseService.getPopularCourses();
        const merged = Array.isArray(newCourses) ? newCourses : (newCourses?.items || newCourses?.courses || []);
        const popularList = Array.isArray(popular) ? popular : (popular?.items || popular?.courses || []);
        const fallback = [...merged, ...popularList];
        setCourses(fallback);
      } else {
        setCourses(list);
      }
    } catch (err) {
      setError(err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchUniversities = async () => {
    try {
      const res = await api.get('/universities');
      const payload = res.data?.data ?? res.data?.universities ?? res.data;
      let list = [];
      if (Array.isArray(payload)) list = payload;
      else if (payload?.items && Array.isArray(payload.items)) list = payload.items;
      else list = [];
      const mapped = list.map(u => ({ id: u.id ?? u.Id, name: u.name ?? u.Name }));
      setUniversities(mapped);
    } catch (err) {
      console.error('Failed to fetch universities', err);
    }
  };

  const navigate = useNavigate();

  if (loading) return <Loading />;
  if (error) return <div style={{ padding: 20, color: 'red' }}>{error}</div>;

  return (
    <div className="course-list-container" style={{ padding: 20 }}>
      <div style={{ marginBottom: 16 }}>
        <label style={{ marginRight: 8 }}>Filter by University:</label>
        <select value={selectedUniversity} onChange={(e) => { setSelectedUniversity(e.target.value); fetchCourses(e.target.value || null); }}>
          <option value="">All Universities</option>
          {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>
      {courses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
          No courses found.
        </div>
      ) : (
        <div className="courses-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
          {courses.map(course => (
            <Card key={course.id || course.courseId} className="course-card" style={{ padding: 12 }}>
              {course.thumbnailUrl && <img src={course.thumbnailUrl} alt={course.title || course.name} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 6, marginBottom: 8 }} />}
              <h3 style={{ margin: '6px 0' }}>{course.title || course.name}</h3>
              <p style={{ color: '#666', fontSize: 13 }}>{course.shortDescription || course.description || ''}</p>
              <p style={{ fontSize: 12, color: '#333', marginTop: 6 }}>{course.universityName || course.UniversityName || ''}</p>
              <p className="difficulty" style={{ fontSize: 12, color: '#999', marginTop: 8 }}>{course.difficultyLevel || course.DifficultyLevel || ''}</p>
              <div style={{ marginTop: 10 }}>
                <button className="btn btn-primary" onClick={() => navigate(`/courses/${course.id || course.courseId}`)}>View Course</button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseList;
