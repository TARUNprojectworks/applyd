import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios';
import { STATUSES, toInputDate, todayInputDate } from '../utils/helpers';

// Same page is used for Add (/applications/new) and Edit (/applications/:id/edit)
function ApplicationForm() {
  const { id } = useParams();
  const isEdit = Boolean(id); // there is an id in the URL -> we are editing
  const navigate = useNavigate();

  const [form, setForm] = useState({
    company: '',
    role: '',
    jobLink: '',
    location: '',
    salaryExpectation: '',
    appliedDate: todayInputDate(),
    status: 'Applied',
    interviewDate: '',
    notes: '',
  });
  const [loading, setLoading] = useState(isEdit); // only need to load data when editing
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // In edit mode, load the existing application and fill the form
  useEffect(() => {
    if (!isEdit) return;
    async function load() {
      try {
        const res = await api.get(`/applications/${id}`);
        const app = res.data;
        setForm({
          company: app.company,
          role: app.role,
          jobLink: app.jobLink || '',
          location: app.location || '',
          salaryExpectation: app.salaryExpectation || '',
          appliedDate: toInputDate(app.appliedDate),
          status: app.status,
          interviewDate: toInputDate(app.interviewDate),
          notes: app.notes || '',
        });
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, isEdit]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.company.trim() || !form.role.trim() || !form.appliedDate) {
      setError('Company, role and applied date are required');
      return;
    }

    const payload = { ...form, interviewDate: form.interviewDate || null };
    if (isEdit) delete payload.status; // status is changed with PATCH, not with edit

    setSaving(true);
    try {
      const res = isEdit
        ? await api.put(`/applications/${id}`, payload)
        : await api.post('/applications', payload);
      navigate(`/applications/${res.data._id}`); // go to the detail page
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  }

  if (loading) return <p className="muted">Loading...</p>;

  return (
    <div className="panel form-panel">
      <div className="page-header">
        <h1 className="page-title">{isEdit ? 'Edit application' : 'Add application'}</h1>
        <Link to={isEdit ? `/applications/${id}` : '/'}>Cancel</Link>
      </div>

      {error && <div className="alert">{error}</div>}

      <form onSubmit={handleSubmit} className="form form-grid">
        <label>
          Company *
          <input name="company" value={form.company} onChange={handleChange} required />
        </label>
        <label>
          Role *
          <input name="role" value={form.role} onChange={handleChange} required />
        </label>
        <label>
          Location
          <input name="location" value={form.location} onChange={handleChange} />
        </label>
        <label>
          Salary expectation
          <input name="salaryExpectation" value={form.salaryExpectation} onChange={handleChange} placeholder="e.g. 6 LPA" />
        </label>
        <label className="span-2">
          Job link
          <input type="url" name="jobLink" value={form.jobLink} onChange={handleChange} placeholder="https://" />
        </label>
        <label>
          Applied date *
          <input type="date" name="appliedDate" value={form.appliedDate} onChange={handleChange} required />
        </label>
        <label>
          Interview date
          <input type="date" name="interviewDate" value={form.interviewDate} onChange={handleChange} />
        </label>

        {/* Status is only chosen when adding. After that it changes from the dropdown on the detail page. */}
        {!isEdit && (
          <label>
            Status
            <select name="status" value={form.status} onChange={handleChange}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="span-2">
          Notes
          <textarea name="notes" rows="4" value={form.notes} onChange={handleChange} />
        </label>

        <div className="span-2">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ApplicationForm;
