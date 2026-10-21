import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { subjectApi } from '../api/subjectApi';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';

function SubjectListPage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Use search params for semester filtering
  const [searchParams, setSearchParams] = useSearchParams();
  const semesterFilter = searchParams.get('semester') || '';

  const fetchSubjects = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (semesterFilter) params.semester = semesterFilter;
      const data = await subjectApi.getAll(params);
      setSubjects(data.subjects || []);
    } catch (err) {
      setError(err.message || 'Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [semesterFilter]);

  const handleSemesterChange = (e) => {
    const sem = e.target.value;
    if (sem) {
      setSearchParams({ semester: sem });
    } else {
      setSearchParams({});
    }
  };

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"? This will also remove all its attendance records!`
    );
    if (!confirmed) return;

    try {
      await subjectApi.delete(id);
      setSuccessMsg(`Subject "${name}" deleted successfully.`);
      setSubjects((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete subject');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Subject Management</h1>
          <p className="page-subtitle">Configure college courses, semesters, and course instructors</p>
        </div>
        <Link to="/admin/subjects/new" className="btn btn-primary">
          + Add New Subject
        </Link>
      </div>

      <AlertMessage type="error" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={successMsg} onClose={() => setSuccessMsg('')} />

      {/* Filter Toolbar using useSearchParams */}
      <div className="toolbar card" style={{ padding: '16px' }}>
        <div className="filter-group">
          <label htmlFor="sem-filter" style={{ fontWeight: 600, fontSize: '0.9rem' }}>
            Filter by Semester:
          </label>
          <select
            id="sem-filter"
            className="form-select"
            style={{ width: '180px' }}
            value={semesterFilter}
            onChange={handleSemesterChange}
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
          {semesterFilter && (
            <button
              onClick={() => setSearchParams({})}
              className="btn btn-secondary btn-sm"
            >
              Clear Filter
            </button>
          )}
        </div>
        <div style={{ fontSize: '0.88rem', color: '#64748b' }}>
          Total subjects: <strong>{subjects.length}</strong>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading subjects..." />
      ) : subjects.length === 0 ? (
        <div className="state-container">
          <p className="state-title">No subjects found</p>
          <p className="state-desc" style={{ marginBottom: '16px' }}>
            {semesterFilter
              ? `No subjects registered for Semester ${semesterFilter}.`
              : 'Start by creating your first course subject.'}
          </p>
          <Link to="/admin/subjects/new" className="btn btn-primary btn-sm">
            Add Subject
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Subject Name</th>
                <th>Code</th>
                <th>Semester</th>
                <th>Assigned Teacher</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((sub) => (
                <tr key={sub._id}>
                  <td style={{ fontWeight: 600 }}>
                    <Link
                      to={`/admin/subjects/${sub._id}`}
                      style={{ color: '#2563eb', textDecoration: 'none' }}
                    >
                      {sub.name}
                    </Link>
                  </td>
                  <td>
                    <span className="badge badge-neutral">{sub.code}</span>
                  </td>
                  <td>Semester {sub.semester}</td>
                  <td>{sub.teacherName}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <Link
                        to={`/admin/subjects/${sub._id}/edit`}
                        className="btn btn-secondary btn-sm"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(sub._id, sub.name)}
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default SubjectListPage;
