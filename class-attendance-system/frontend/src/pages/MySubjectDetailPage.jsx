import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { attendanceApi } from '../api/attendanceApi';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';

function MySubjectDetailPage() {
  const { subjectId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await attendanceApi.getMySubjectDetail(subjectId);
        setData(res);
      } catch (err) {
        setError(err.message || 'Failed to load subject attendance history');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [subjectId]);

  if (loading) {
    return <LoadingSpinner message="Loading lecture attendance logs..." />;
  }

  if (error || !data) {
    return (
      <div>
        <AlertMessage type="error" message={error || 'Could not load details'} />
        <Link to="/my-attendance" className="btn btn-secondary">
          &larr; Back to My Attendance
        </Link>
      </div>
    );
  }

  const { subject, totalClasses, attendedClasses, percentage, history } = data;
  const isSafe = percentage >= 75;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{subject.name}</h1>
          <p className="page-subtitle">
            Code: <strong>{subject.code}</strong> &bull; Semester {subject.semester} &bull; Instructor: <strong>{subject.teacherName}</strong>
          </p>
        </div>
        <Link to="/my-attendance" className="btn btn-secondary">
          &larr; Back to Summary
        </Link>
      </div>

      {/* Attendance Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Attendance Percentage</span>
            <span style={{ fontSize: '1.2rem' }}>📈</span>
          </div>
          <div className="stat-value" style={{ color: totalClasses === 0 ? '#64748b' : isSafe ? '#16a34a' : '#dc2626' }}>
            {totalClasses > 0 ? `${percentage}%` : 'N/A'}
          </div>
          <div className="stat-subtext">
            {totalClasses > 0
              ? isSafe
                ? 'Meets 75% criterion'
                : 'Warning: Shortage'
              : 'No classes conducted'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Classes Attended</span>
            <span style={{ fontSize: '1.2rem' }}>✅</span>
          </div>
          <div className="stat-value" style={{ color: '#16a34a' }}>
            {attendedClasses}
          </div>
          <div className="stat-subtext">Present marks</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Classes Conducted</span>
            <span style={{ fontSize: '1.2rem' }}>📅</span>
          </div>
          <div className="stat-value">{totalClasses}</div>
          <div className="stat-subtext">Total lectures held</div>
        </div>
      </div>

      {/* Date-wise History Table */}
      <div className="card">
        <h2 className="card-title">Date-Wise Attendance Log</h2>
        {history.length === 0 ? (
          <div className="state-container">
            <p className="state-title">No attendance recorded</p>
            <p className="state-desc">
              Your instructor has not yet submitted attendance sheets for this subject.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>#</th>
                  <th>Lecture Date</th>
                  <th>Day</th>
                  <th style={{ textAlign: 'right', width: '160px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record, index) => {
                  const isPresent = record.status === 'Present';
                  const dateObj = new Date(record.date);
                  const dayName = isNaN(dateObj.getTime())
                    ? ''
                    : dateObj.toLocaleDateString(undefined, { weekday: 'long' });

                  return (
                    <tr key={`${record.date}-${index}`}>
                      <td>{index + 1}</td>
                      <td style={{ fontWeight: 600 }}>{record.date}</td>
                      <td style={{ color: '#64748b' }}>{dayName}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={`badge ${isPresent ? 'badge-success' : 'badge-danger'}`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default MySubjectDetailPage;
