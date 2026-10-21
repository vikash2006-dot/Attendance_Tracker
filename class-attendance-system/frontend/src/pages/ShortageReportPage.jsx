import React, { useState, useEffect } from 'react';
import { attendanceApi } from '../api/attendanceApi';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';

function ShortageReportPage() {
  const [shortageList, setShortageList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchShortageReport = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await attendanceApi.getShortageReport();
      setShortageList(data.shortageList || []);
    } catch (err) {
      setError(err.message || 'Failed to load shortage report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShortageReport();
  }, []);

  const filteredList = shortageList.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.studentName.toLowerCase().includes(term) ||
      item.rollNumber.toLowerCase().includes(term) ||
      item.subjectName.toLowerCase().includes(term) ||
      item.subjectCode.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance Shortage Report</h1>
          <p className="page-subtitle">
            Students whose attendance is below the mandatory 75% threshold in any course
          </p>
        </div>
        <button onClick={fetchShortageReport} className="btn btn-secondary btn-sm">
          🔄 Refresh Data
        </button>
      </div>

      <AlertMessage type="error" message={error} onClose={() => setError('')} />

      {/* Info Card explaining the 75% formula */}
      <div className="card" style={{ background: '#fffbeb', borderColor: '#fef3c7', padding: '16px 20px', marginBottom: '20px' }}>
        <p style={{ fontSize: '0.88rem', color: '#92400e', lineHeight: 1.5 }}>
          💡 <strong>75% Recovery Rule:</strong> For total classes <em>(A)</em> and attended classes <em>(P)</em>, the minimum consecutive classes needed to attain 75% attendance is computed as:
          <code style={{ background: '#fde68a', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', fontWeight: 600 }}>
            Math.max(0, Math.ceil(3 * A - 4 * P))
          </code>
        </p>
      </div>

      {/* Search Toolbar */}
      <div className="toolbar card" style={{ padding: '16px' }}>
        <div style={{ flex: 1, maxWidth: '400px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by student name, roll number, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ fontSize: '0.88rem', color: '#64748b' }}>
          Total shortage cases: <strong style={{ color: '#dc2626' }}>{shortageList.length}</strong>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Evaluating 75% attendance criteria across all students..." />
      ) : shortageList.length === 0 ? (
        <div className="state-container">
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🎉</div>
          <p className="state-title">No Attendance Shortages!</p>
          <p className="state-desc">
            All registered students are currently meeting or exceeding the 75% attendance requirement.
          </p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="state-container">
          <p className="state-title">No matching students found</p>
          <p className="state-desc">Try clearing your search query "{searchTerm}".</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Roll Number</th>
                <th>Sem / Sec</th>
                <th>Subject</th>
                <th>Classes Conducted</th>
                <th>Classes Attended</th>
                <th>Current %</th>
                <th style={{ backgroundColor: '#fff1f2', color: '#9f1239' }}>
                  Classes Needed for 75%
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((item, idx) => (
                <tr key={`${item.studentId}-${item.subjectId}-${idx}`}>
                  <td style={{ fontWeight: 600 }}>{item.studentName}</td>
                  <td>
                    <span className="badge badge-neutral">{item.rollNumber}</span>
                  </td>
                  <td>
                    Sem {item.semester} - {item.section}
                  </td>
                  <td>
                    <div><strong>{item.subjectName}</strong></div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{item.subjectCode}</span>
                  </td>
                  <td>{item.totalClasses}</td>
                  <td>{item.attendedClasses}</td>
                  <td>
                    <span className="badge badge-danger" style={{ fontWeight: 700 }}>
                      {item.percentage}%
                    </span>
                  </td>
                  <td style={{ backgroundColor: '#fff1f2' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        background: '#e11d48',
                        color: '#ffffff',
                        borderRadius: '20px',
                        fontWeight: 700,
                        fontSize: '0.85rem'
                      }}
                    >
                      +{item.requiredClasses} class{item.requiredClasses > 1 ? 'es' : ''}
                    </span>
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

export default ShortageReportPage;
