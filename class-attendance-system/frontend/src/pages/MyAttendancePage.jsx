import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { attendanceApi } from '../api/attendanceApi';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';

function MyAttendancePage({ user }) {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const data = await attendanceApi.getMySummary();
        setSummary(data.summary || []);
      } catch (err) {
        setError(err.message || 'Failed to load attendance records');
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your attendance records..." />;
  }

  // Calculate cumulative stats across all subjects
  let totalAllClasses = 0;
  let totalAllAttended = 0;
  summary.forEach((item) => {
    totalAllClasses += item.totalClasses;
    totalAllAttended += item.attendedClasses;
  });

  const overallPercentage =
    totalAllClasses > 0
      ? Number(((totalAllAttended / totalAllClasses) * 100).toFixed(1))
      : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Attendance</h1>
          <p className="page-subtitle">
            Welcome, <strong>{user?.name}</strong> &bull; Roll No: <strong>{user?.rollNumber}</strong> &bull; Semester {user?.semester} (Sec {user?.section})
          </p>
        </div>
      </div>

      <AlertMessage type="error" message={error} onClose={() => setError('')} />

      {/* Overview Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Overall Attendance</span>
            <span style={{ fontSize: '1.2rem' }}>📊</span>
          </div>
          <div className="stat-value" style={{ color: overallPercentage >= 75 ? '#16a34a' : '#dc2626' }}>
            {totalAllClasses > 0 ? `${overallPercentage}%` : 'N/A'}
          </div>
          <div className="stat-subtext">
            {totalAllClasses > 0
              ? `${totalAllAttended} of ${totalAllClasses} lectures attended`
              : 'No lectures held yet'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Enrolled Subjects</span>
            <span style={{ fontSize: '1.2rem' }}>📖</span>
          </div>
          <div className="stat-value">{summary.length}</div>
          <div className="stat-subtext">Semester {user?.semester} courses</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Status</span>
            <span style={{ fontSize: '1.2rem' }}>🎯</span>
          </div>
          <div className="stat-value">
            {totalAllClasses === 0 ? (
              <span style={{ color: '#64748b' }}>Pending</span>
            ) : overallPercentage >= 75 ? (
              <span style={{ color: '#16a34a' }}>Eligible</span>
            ) : (
              <span style={{ color: '#dc2626' }}>Shortage</span>
            )}
          </div>
          <div className="stat-subtext">
            {overallPercentage >= 75
              ? 'Above 75% required criteria'
              : totalAllClasses === 0
              ? 'Awaiting class records'
              : 'Below 75% minimum requirement'}
          </div>
        </div>
      </div>

      {/* Subject-Wise Attendance Cards */}
      <div className="card">
        <h2 className="card-title">Subject-Wise Breakdown</h2>
        {summary.length === 0 ? (
          <div className="state-container">
            <p className="state-title">No subjects registered</p>
            <p className="state-desc">There are no subjects configured for Semester {user?.semester} yet.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Code</th>
                  <th>Teacher</th>
                  <th>Total Classes</th>
                  <th>Attended</th>
                  <th>Percentage</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((item) => {
                  const hasClasses = item.totalClasses > 0;
                  const isSafe = item.percentage >= 75;
                  return (
                    <tr key={item.subject._id}>
                      <td style={{ fontWeight: 600 }}>{item.subject.name}</td>
                      <td>
                        <span className="badge badge-neutral">{item.subject.code}</span>
                      </td>
                      <td>{item.subject.teacherName}</td>
                      <td>{item.totalClasses}</td>
                      <td>
                        <span style={{ fontWeight: 600, color: isSafe ? '#16a34a' : '#dc2626' }}>
                          {item.attendedClasses}
                        </span>
                      </td>
                      <td style={{ minWidth: '160px' }}>
                        {hasClasses ? (
                          <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span
                                className={`badge ${isSafe ? 'badge-success' : 'badge-danger'}`}
                                style={{ fontWeight: 700 }}
                              >
                                {item.percentage}%
                              </span>
                              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                {isSafe ? 'Satisfactory' : 'Shortage'}
                              </span>
                            </div>
                            <div className="progress-container">
                              <div
                                className={`progress-bar ${isSafe ? 'high' : 'low'}`}
                                style={{ width: `${Math.min(item.percentage, 100)}%` }}
                              ></div>
                            </div>
                          </>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>
                            No classes held
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link
                          to={`/my-attendance/${item.subject._id}`}
                          className="btn btn-secondary btn-sm"
                        >
                          View Dates &rarr;
                        </Link>
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

export default MyAttendancePage;
