import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import AlertMessage from '../components/AlertMessage';

function RegisterPage({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    semester: 4,
    section: 'A'
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'rollNumber' ? value.toUpperCase() : value
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email address is required';
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.rollNumber.trim()) newErrors.rollNumber = 'Roll number is required';
    if (!formData.semester) newErrors.semester = 'Semester is required';
    if (!formData.section.trim()) newErrors.section = 'Section is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const data = await authApi.register({
        ...formData,
        semester: Number(formData.semester)
      });
      onLogin(data.user, data.token);
      navigate('/my-attendance');
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        <div className="auth-header">
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📝</div>
          <h1 className="auth-title">Student Registration</h1>
          <p className="auth-subtitle">Create your student account to track class attendance</p>
        </div>

        <AlertMessage type="error" message={serverError} />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name *</label>
            <input
              id="reg-name"
              type="text"
              name="name"
              className="form-input"
              placeholder="e.g. Diya Patel"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">College Email *</label>
            <input
              id="reg-email"
              type="email"
              name="email"
              className="form-input"
              placeholder="e.g. diya@college.edu"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password (min. 6 characters) *</label>
            <input
              id="reg-password"
              type="password"
              name="password"
              className="form-input"
              placeholder="Create a secure password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-roll">Roll Number *</label>
              <input
                id="reg-roll"
                type="text"
                name="rollNumber"
                className="form-input"
                placeholder="e.g. CS202402"
                value={formData.rollNumber}
                onChange={handleChange}
              />
              {errors.rollNumber && <p className="form-error">{errors.rollNumber}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-sem">Semester *</label>
              <select
                id="reg-sem"
                name="semester"
                className="form-select"
                value={formData.semester}
                onChange={handleChange}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-sec">Section *</label>
              <input
                id="reg-sec"
                type="text"
                name="section"
                className="form-input"
                placeholder="e.g. A"
                maxLength={4}
                value={formData.section}
                onChange={handleChange}
              />
              {errors.section && <p className="form-error">{errors.section}</p>}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '12px' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register as Student'}
          </button>
        </form>

        <div className="auth-footer">
          Already registered? <Link to="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
