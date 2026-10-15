import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios';
import StatsCards from '../components/StatsCards';
import ListView from '../components/ListView';
import BoardView from '../components/BoardView';
import { STATUSES } from '../utils/helpers';

// Remember which view (list/board) the user picked last time
function getSavedView() {
  return localStorage.getItem('view') === 'board' ? 'board' : 'list';
}

function Dashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState('');

  // Filters - sent to the backend as query params
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sort, setSort] = useState('newest');

  const [view, setView] = useState(getSavedView);
  const [updatingId, setUpdatingId] = useState(null); // id of the row whose status is being saved

  // Load stats cards
  async function loadStats() {
    try {
      const res = await api.get('/applications/stats');
      setStats(res.data);
      setStatsError('');
    } catch (err) {
      setStatsError(getErrorMessage(err));
    }
  }

  // Load stats once when the page opens
  useEffect(() => {
    loadStats();
  }, []);

  // Load applications whenever a filter changes.
  // The 300ms timer avoids sending a request for every key typed in the search box.
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/applications', {
          params: { search, status: statusFilter, sort }, // -> ?search=..&status=..&sort=..
        });
        setApplications(res.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer); // cancel the old timer if the user keeps typing
  }, [search, statusFilter, sort]);

  function changeView(newView) {
    setView(newView);
    localStorage.setItem('view', newView);
  }

  // Called by the status dropdown in ListView / BoardView
  async function handleStatusChange(id, status) {
    setUpdatingId(id);
    setError('');
    try {
      const res = await api.patch(`/applications/${id}/status`, { status });
      // Replace the changed application in state with the updated one from the server
      setApplications((prev) => prev.map((app) => (app._id === id ? res.data : app)));
      loadStats(); // counts changed, refresh the cards
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  }

  const hasFilters = search !== '' || statusFilter !== '';

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Applications</h1>
        <Link to="/applications/new" className="btn btn-primary">
          Add
        </Link>
      </div>

      {statsError && <div className="alert">{statsError}</div>}
      {stats ? <StatsCards stats={stats} /> : !statsError && <p className="muted">Loading stats...</p>}

      <div className="toolbar panel">
        <input
          type="search"
          placeholder="Search company or role"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Applied: newest first</option>
          <option value="oldest">Applied: oldest first</option>
        </select>

        <div className="view-toggle">
          <button className={view === 'list' ? 'active' : ''} onClick={() => changeView('list')}>
            List
          </button>
          <button className={view === 'board' ? 'active' : ''} onClick={() => changeView('board')}>
            Board
          </button>
        </div>
      </div>

      {error && <div className="alert">{error}</div>}

      {loading ? (
        <p className="muted">Loading applications...</p>
      ) : applications.length === 0 ? (
        <div className="panel empty">
          {hasFilters ? 'No applications match these filters.' : 'No applications yet. Click "Add" to create one.'}
        </div>
      ) : view === 'list' ? (
        <ListView applications={applications} onStatusChange={handleStatusChange} updatingId={updatingId} />
      ) : (
        <BoardView applications={applications} onStatusChange={handleStatusChange} updatingId={updatingId} />
      )}
    </div>
  );
}

export default Dashboard;
