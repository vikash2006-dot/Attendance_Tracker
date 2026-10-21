import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { subjectApi } from '../api/subjectApi';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';

function SubjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const res = await subjectApi.getById(id);
        setSubject(res.subject);
      } catch (err) {
        setError(err.message || 'Failed to fetch subject details');
      } finally {
        setLoading(false);
      }
    };
    fetchSubject();
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Loading subject details..." />;
  }

  if (error || !subject) {
    return (
      <div>
        <AlertMessage type="error" message={error || 'Subject not found'} />
        <Link to="/admin/subjects" className="btn btn-secondary">
          &larr; Back to Subjects
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">{subject.name}</h1>
          <p className="page-subtitle">Code: {subject.code} &bull; Semester {subject.semester}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to={`/admin/subjects/${subject._id}/edit`} className="btn btn-primary">
            Edit Subject
          </Link>
          <Link to="/admin/subjects" className="btn btn-secondary">
            Back to List
          </Link>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Subject Information</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Subject Name</span>
            <p style={{ fontWeight: 600, fontSize: '1.05rem', marginTop: '2px' }}>{subject.name}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Subject Code</span>
            <p style={{ fontWeight: 600, fontSize: '1.05rem', marginTop: '2px' }}>
              <span className="badge badge-neutral">{subject.code}</span>
            </p>
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Semester</span>
            <p style={{ fontWeight: 600, fontSize: '1.05rem', marginTop: '2px' }}>Semester {subject.semester}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Assigned Instructor</span>
            <p style={{ fontWeight: 600, fontSize: '1.05rem', marginTop: '2px' }}>{subject.teacherName}</p>
          </div>
        </div>

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
          <Link
            to={`/admin/attendance/mark?subjectId=${subject._id}`}
            className="btn btn-primary btn-sm"
          >
            Mark Attendance for this Subject &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SubjectDetailPage;
