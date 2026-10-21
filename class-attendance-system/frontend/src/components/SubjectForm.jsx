import React, { useState, useEffect } from 'react';
import AlertMessage from './AlertMessage';

function SubjectForm({ initialData = {}, onSubmit, isLoading, serverError, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    semester: 1,
    teacherName: ''
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        name: initialData.name || '',
        code: initialData.code || '',
        semester: initialData.semester || 1,
        teacherName: initialData.teacherName || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'code' ? value.toUpperCase() : value
    }));

    // Clear specific field validation error when user types
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Subject name is required';
    if (!formData.code.trim()) errors.code = 'Subject code is required';
    if (!formData.semester || formData.semester < 1 || formData.semester > 8) {
      errors.semester = 'Semester must be between 1 and 8';
    }
    if (!formData.teacherName.trim()) errors.teacherName = 'Teacher name is required';
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    onSubmit({
      ...formData,
      semester: Number(formData.semester)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card" style={{ maxWidth: '640px', margin: '0 auto' }}>
      <AlertMessage type="error" message={serverError} />

      <div className="form-group">
        <label htmlFor="subject-name" className="form-label">
          Subject Name *
        </label>
        <input
          id="subject-name"
          type="text"
          name="name"
          className="form-input"
          placeholder="e.g. Data Structures & Algorithms"
          value={formData.name}
          onChange={handleChange}
        />
        {validationErrors.name && <p className="form-error">{validationErrors.name}</p>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="subject-code" className="form-label">
            Subject Code *
          </label>
          <input
            id="subject-code"
            type="text"
            name="code"
            className="form-input"
            placeholder="e.g. CS401"
            value={formData.code}
            onChange={handleChange}
          />
          {validationErrors.code && <p className="form-error">{validationErrors.code}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="subject-semester" className="form-label">
            Semester (1 - 8) *
          </label>
          <select
            id="subject-semester"
            name="semester"
            className="form-select"
            value={formData.semester}
            onChange={handleChange}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
          {validationErrors.semester && <p className="form-error">{validationErrors.semester}</p>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="subject-teacher" className="form-label">
          Teacher Name *
        </label>
        <input
          id="subject-teacher"
          type="text"
          name="teacherName"
          className="form-input"
          placeholder="e.g. Dr. Suresh Raina"
          value={formData.teacherName}
          onChange={handleChange}
        />
        {validationErrors.teacherName && <p className="form-error">{validationErrors.teacherName}</p>}
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={isLoading}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData._id ? 'Update Subject' : 'Add Subject'}
        </button>
      </div>
    </form>
  );
}

export default SubjectForm;
