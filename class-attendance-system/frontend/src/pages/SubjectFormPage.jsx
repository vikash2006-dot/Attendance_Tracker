import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { subjectApi } from '../api/subjectApi';
import SubjectForm from '../components/SubjectForm';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';

function SubjectFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      const loadSubject = async () => {
        try {
          const res = await subjectApi.getById(id);
          setInitialData(res.subject);
        } catch (err) {
          setError(err.message || 'Failed to fetch subject details');
        } finally {
          setLoading(false);
        }
      };
      loadSubject();
    }
  }, [id, isEditMode]);

  const handleSubmit = async (formData) => {
    setSaving(true);
    setError('');
    try {
      if (isEditMode) {
        await subjectApi.update(id, formData);
      } else {
        await subjectApi.create(formData);
      }
      navigate('/admin/subjects');
    } catch (err) {
      setError(err.message || 'Error saving subject');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ maxWidth: '640px', margin: '0 auto 24px' }}>
        <div>
          <h1 className="page-title">{isEditMode ? 'Edit Subject' : 'Add New Subject'}</h1>
          <p className="page-subtitle">
            {isEditMode
              ? 'Update the details for this course subject'
              : 'Enter the subject name, unique code, semester and teacher'}
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading subject details..." />
      ) : (
        <SubjectForm
          initialData={initialData || {}}
          onSubmit={handleSubmit}
          isLoading={saving}
          serverError={error}
          onCancel={() => navigate('/admin/subjects')}
        />
      )}
    </div>
  );
}

export default SubjectFormPage;
