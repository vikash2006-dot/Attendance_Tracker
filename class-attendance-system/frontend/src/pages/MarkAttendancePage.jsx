import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { subjectApi } from '../api/subjectApi';
import { attendanceApi } from '../api/attendanceApi';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';

function MarkAttendancePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Subjects for dropdown
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(searchParams.get('subjectId') || '');
  const [selectedDate, setSelectedDate] = useState(
    searchParams.get('date') || new Date().toISOString().split('T')[0]
  );
  const [selectedSection, setSelectedSection] = useState(searchParams.get('section') || 'ALL');

  // Attendance sheet data
  const [sheetData, setSheetData] = useState(null);
  const [records, setRecords] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Fetch all subjects for the dropdown
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await subjectApi.getAll();
        setSubjects(res.subjects || []);
        // If no subject selected yet and subjects exist, pick first
        if (!selectedSubjectId && res.subjects && res.subjects.length > 0) {
          setSelectedSubjectId(res.subjects[0]._id);
        }
      } catch (err) {
        setError('Failed to load subjects for attendance marking');
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, []);

  // 2. Fetch sheet whenever subjectId, date, or section changes
  const loadSheet = async (subId, dateVal, secVal) => {
    if (!subId || !dateVal) return;
    setLoadingSheet(true);
    setError('');
    setSuccessMsg('');
    try {
      const data = await attendanceApi.getSheet(subId, dateVal, secVal);
      setSheetData(data);
      setRecords(data.records || []);
    } catch (err) {
      setError(err.message || 'Failed to load attendance sheet');
      setSheetData(null);
      setRecords([]);
    } finally {
      setLoadingSheet(false);
    }
  };

  useEffect(() => {
    if (selectedSubjectId && selectedDate) {
      setSearchParams({
        subjectId: selectedSubjectId,
        date: selectedDate,
        ...(selectedSection !== 'ALL' ? { section: selectedSection } : {})
      });
      loadSheet(selectedSubjectId, selectedDate, selectedSection);
    }
  }, [selectedSubjectId, selectedDate, selectedSection]);

  // Toggle single student's status
  const handleToggleStatus = (studentId, newStatus) => {
    setRecords((prev) =>
      prev.map((r) => {
        const id = r.student._id || r.student;
        if (id === studentId) {
          return { ...r, status: newStatus };
        }
        return r;
      })
    );
  };

  // Bulk actions: Mark all Present or all Absent
  const handleMarkAll = (status) => {
    setRecords((prev) => prev.map((r) => ({ ...r, status })));
  };

  // Submit attendance sheet
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSubjectId || !selectedDate) {
      setError('Please select both a subject and date');
      return;
    }
    if (records.length === 0) {
      setError('No students available to mark attendance for this subject');
      return;
    }

    setSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      const payload = {
        subjectId: selectedSubjectId,
        date: selectedDate,
        section: selectedSection,
        records: records.map((r) => ({
          studentId: r.student._id || r.student,
          status: r.status
        }))
      };

      const res = await attendanceApi.markAttendance(payload);
      setSuccessMsg(res.message || 'Attendance saved successfully!');

      // Reload sheet to ensure latest synced state
      await loadSheet(selectedSubjectId, selectedDate, selectedSection);
    } catch (err) {
      setError(err.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  // Quick stats for current form view
  const totalStudents = records.length;
  const presentCount = records.filter((r) => r.status === 'Present').length;
  const absentCount = totalStudents - presentCount;
  const currentPercentage =
    totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : 0;

  if (loadingSubjects) {
    return <LoadingSpinner message="Loading course subjects..." />;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Mark Class Attendance</h1>
          <p className="page-subtitle">
            Select course and date to record or update student attendance
          </p>
        </div>
      </div>

      <AlertMessage type="error" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={successMsg} onClose={() => setSuccessMsg('')} />

      {/* Selector Card */}
      <div className="card">
        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="select-subject" className="form-label">
              Select Subject *
            </label>
            <select
              id="select-subject"
              className="form-select"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
            >
              {subjects.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.name} ({sub.code}) - Semester {sub.semester}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="select-date" className="form-label">
              Lecture Date *
            </label>
            <input
              id="select-date"
              type="date"
              className="form-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="select-section" className="form-label">
              Filter Section
            </label>
            <select
              id="select-section"
              className="form-select"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
            >
              <option value="ALL">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>
        </div>
      </div>

      {loadingSheet ? (
        <LoadingSpinner message="Fetching eligible students and existing records..." />
      ) : !sheetData ? null : (
        <div>
          {/* Status banner whether sheet was loaded or newly prepared */}
          {sheetData.sheetExists ? (
            <div className="alert alert-info" style={{ marginBottom: '16px' }}>
              <span>
                ℹ️ <strong>Existing Attendance Sheet Loaded:</strong> Modifying records for {selectedDate}. Updates will replace the saved sheet without creating duplicates.
              </span>
            </div>
          ) : (
            <div className="alert alert-info" style={{ marginBottom: '16px', background: '#f8fafc', borderColor: '#cbd5e1', color: '#475569' }}>
              <span>
                📝 <strong>New Attendance Sheet:</strong> No record exists yet for {selectedDate}. All students defaulted to Present.
              </span>
            </div>
          )}

          {/* Quick Stats & Bulk Actions Toolbar */}
          <div className="card" style={{ padding: '16px 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '18px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <span className="stat-label">Total Students:</span>{' '}
                <strong>{totalStudents}</strong>
              </div>
              <div>
                <span className="stat-label">Present:</span>{' '}
                <strong style={{ color: '#16a34a' }}>{presentCount}</strong>
              </div>
              <div>
                <span className="stat-label">Absent:</span>{' '}
                <strong style={{ color: '#dc2626' }}>{absentCount}</strong>
              </div>
              <div>
                <span className="stat-label">Class Attendance:</span>{' '}
                <strong style={{ color: currentPercentage >= 75 ? '#16a34a' : '#dc2626' }}>
                  {currentPercentage}%
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleMarkAll('Present')}
                className="btn btn-secondary btn-sm"
              >
                Mark All Present
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll('Absent')}
                className="btn btn-secondary btn-sm"
              >
                Mark All Absent
              </button>
            </div>
          </div>

          {/* Students Marking Table */}
          {records.length === 0 ? (
            <div className="state-container">
              <p className="state-title">No eligible students found</p>
              <p className="state-desc">
                No students enrolled in Semester {sheetData.subject?.semester}{' '}
                {selectedSection !== 'ALL' ? `(Section ${selectedSection})` : ''}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="table-container" style={{ marginBottom: '20px' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>#</th>
                      <th>Roll Number</th>
                      <th>Student Name</th>
                      <th>Semester</th>
                      <th>Section</th>
                      <th style={{ textAlign: 'center', width: '200px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r, index) => {
                      const st = r.student || {};
                      const isPresent = r.status === 'Present';
                      return (
                        <tr key={st._id || index}>
                          <td>{index + 1}</td>
                          <td style={{ fontWeight: 600 }}>{st.rollNumber}</td>
                          <td>{st.name}</td>
                          <td>Sem {st.semester}</td>
                          <td>{st.section}</td>
                          <td style={{ textAlign: 'center' }}>
                            <div className="attendance-toggle">
                              <button
                                type="button"
                                className={`toggle-btn ${isPresent ? 'active-present' : ''}`}
                                onClick={() => handleToggleStatus(st._id, 'Present')}
                              >
                                Present
                              </button>
                              <button
                                type="button"
                                className={`toggle-btn ${!isPresent ? 'active-absent' : ''}`}
                                onClick={() => handleToggleStatus(st._id, 'Absent')}
                              >
                                Absent
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ minWidth: '180px' }}
                  disabled={saving}
                >
                  {saving
                    ? 'Saving Attendance...'
                    : sheetData.sheetExists
                    ? 'Update Attendance Sheet'
                    : 'Submit Attendance Sheet'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default MarkAttendancePage;
