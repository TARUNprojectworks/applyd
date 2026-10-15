import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios';
import StatusSelect from '../components/StatusSelect';
import FollowUpLabel from '../components/FollowUpLabel';
import Timeline from '../components/Timeline';
import { formatDate } from '../utils/helpers';

function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); // error while loading the page
  const [actionError, setActionError] = useState(''); // error from status change / delete
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.get(`/applications/${id}`);
        setApplication(res.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleStatusChange(status) {
    setUpdating(true);
    setActionError('');
    try {
      const res = await api.patch(`/applications/${id}/status`, { status });
      setApplication(res.data); // response includes the new statusHistory, so the timeline updates
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete() {
    // Built-in browser confirm box, returns true if user clicks OK
    if (!window.confirm(`Delete the application for ${application.company}?`)) return;

    setDeleting(true);
    setActionError('');
    try {
      await api.delete(`/applications/${id}`);
      navigate('/');
    } catch (err) {
      setActionError(getErrorMessage(err));
      setDeleting(false);
    }
  }

  if (loading) return <p className="muted">Loading...</p>;

  if (error) {
    return (
      <div>
        <div className="alert">{error}</div>
        <Link to="/">Back to applications</Link>
      </div>
    );
  }

  return (
    <div>
      <p className="small">
        <Link to="/">Back to applications</Link>
      </p>

      <div className="page-header">
        <div>
          <h1 className="page-title">
            {application.company} <FollowUpLabel application={application} />
          </h1>
          <div className="muted">{application.role}</div>
        </div>
        <div className="actions">
          <Link to={`/applications/${id}/edit`} className="btn">
            Edit
          </Link>
          <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {actionError && <div className="alert">{actionError}</div>}

      <div className="detail-layout">
        <section className="panel">
          <h2 className="section-title">Details</h2>
          <dl className="details">
            <dt>Status</dt>
            <dd>
              <StatusSelect value={application.status} onChange={handleStatusChange} disabled={updating} />
              {updating && <span className="muted small"> Saving...</span>}
            </dd>

            <dt>Applied</dt>
            <dd>{formatDate(application.appliedDate)}</dd>

            <dt>Interview</dt>
            <dd>{formatDate(application.interviewDate)}</dd>

            <dt>Location</dt>
            <dd>{application.location || '-'}</dd>

            <dt>Salary</dt>
            <dd>{application.salaryExpectation || '-'}</dd>

            <dt>Job link</dt>
            <dd>
              {application.jobLink ? (
                <a href={application.jobLink} target="_blank" rel="noopener noreferrer">
                  {application.jobLink}
                </a>
              ) : (
                '-'
              )}
            </dd>

            <dt>Notes</dt>
            <dd className="notes">{application.notes || '-'}</dd>
          </dl>
        </section>

        <section className="panel">
          <h2 className="section-title">Status history</h2>
          <Timeline history={application.statusHistory} />
        </section>
      </div>
    </div>
  );
}

export default ApplicationDetail;
