import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../api/dashboardApi';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';

function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await dashboardApi.getStats();
      setData(response);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Calculating real-time attendance statistics..." />;
  }

  const metrics = data?.metrics || {};
  const todaySummary = data?.todaySummary || [];
  const subjectWiseStats = data?.subjectWiseStats || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">
            System overview and attendance analytics for today ({data?.todayDate || 'Current Session'})
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/admin/attendance/mark" className="btn btn-primary">
            + Mark Attendance
          </Link>
          <Link to="/admin/subjects/new" className="btn btn-secondary">
            + Add Subject
          </Link>
        </div>
      </div>

      <AlertMessage type="error" message={error} onClose={() => setError('')} />

      {/* Top Statistic Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Today's Attendance</span>
            <span style={{ fontSize: '1.2rem' }}>📅</span>
          </div>
          <div className="stat-value">{metrics.todayOverallPercentage ?? 0}%</div>
          <div className="stat-subtext">
            {metrics.todayClassesMarked || 0} class(es) marked today ({metrics.todayPresentMarks || 0} presents / {metrics.todayTotalMarks || 0} slots)
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Students with Shortage (&lt;75%)</span>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
          </div>
          <div className="stat-value" style={{ color: metrics.studentsWithShortageCount > 0 ? '#dc2626' : '#16a34a' }}>
            {metrics.studentsWithShortageCount || 0}
          </div>
          <div className="stat-subtext">
            <Link to="/admin/shortage" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>
              View shortage list &rarr;
            </Link>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Registered Students</span>
            <span style={{ fontSize: '1.2rem' }}>👨‍🎓</span>
          </div>
          <div className="stat-value">{metrics.totalStudents || 0}</div>
          <div className="stat-subtext">Active student profiles</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Subjects</span>
            <span style={{ fontSize: '1.2rem' }}>📚</span>
          </div>
          <div className="stat-value">{metrics.totalSubjects || 0}</div>
          <div className="stat-subtext">
            <Link to="/admin/subjects" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>
              Manage subjects &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Today's Attendance Activity */}
      <div className="card">
        <h2 className="card-title">Today's Attendance Summary</h2>
        {todaySummary.length === 0 ? (
          <div className="state-container" style={{ padding: '32px 16px' }}>
            <p className="state-title">No attendance marked yet today</p>
            <p className="state-desc" style={{ marginBottom: '16px' }}>
              Select a subject and date to record attendance for today's lectures.
            </p>
            <Link to="/admin/attendance/mark" className="btn btn-primary btn-sm">
              Mark Attendance Now
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Code</th>
                  <th>Semester</th>
                  <th>Section</th>
                  <th>Total Enrolled</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {todaySummary.map((item, idx) => (
                  <tr key={item.sheetId || idx}>
                    <td style={{ fontWeight: 600 }}>{item.subjectName}</td>
                    <td>{item.subjectCode}</td>
                    <td>Semester {item.semester}</td>
                    <td>{item.section}</td>
                    <td>{item.total}</td>
                    <td><span className="badge badge-success">{item.present}</span></td>
                    <td><span className="badge badge-danger">{item.absent}</span></td>
                    <td>
                      <span className={`badge ${item.percentage >= 75 ? 'badge-success' : 'badge-danger'}`}>
                        {item.percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Subject-Wise Cumulative Average Attendance */}
      <div className="card">
        <h2 className="card-title">Subject-Wise Cumulative Attendance</h2>
        <p className="page-subtitle" style={{ marginBottom: '16px' }}>
          Cumulative statistics across all past lectures conducted
        </p>
        {subjectWiseStats.length === 0 ? (
          <div className="state-container" style={{ padding: '24px' }}>
            <p className="state-title">No subjects found</p>
            <Link to="/admin/subjects/new" className="btn btn-primary btn-sm" style={{ marginTop: '8px' }}>
              Create First Subject
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Code</th>
                  <th>Semester</th>
                  <th>Teacher</th>
                  <th>Classes Conducted</th>
                  <th>Average Attendance</th>
                </tr>
              </thead>
              <tbody>
                {subjectWiseStats.map((sub) => (
                  <tr key={sub.subjectId}>
                    <td style={{ fontWeight: 600 }}>{sub.subjectName}</td>
                    <td>{sub.subjectCode}</td>
                    <td>Semester {sub.semester}</td>
                    <td>{sub.teacherName}</td>
                    <td>{sub.totalClassesConducted}</td>
                    <td style={{ minWidth: '180px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 600, color: sub.averagePercentage >= 75 ? '#16a34a' : '#dc2626' }}>
                          {sub.averagePercentage}%
                        </span>
                        <span className="stat-subtext">
                          {sub.totalClassesConducted > 0 ? (sub.averagePercentage >= 75 ? 'Healthy' : 'Below 75%') : 'No classes'}
                        </span>
                      </div>
                      <div className="progress-container">
                        <div
                          className={`progress-bar ${sub.averagePercentage >= 75 ? 'high' : 'low'}`}
                          style={{ width: `${Math.min(sub.averagePercentage, 100)}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboardPage;
