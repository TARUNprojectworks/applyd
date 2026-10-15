import { Link } from 'react-router-dom';
import StatusSelect from './StatusSelect';
import FollowUpLabel from './FollowUpLabel';
import { STATUSES, formatDate } from '../utils/helpers';

// 4 columns, one per status. Cards are grouped with a simple filter() - no drag and drop.
// To move a card you change its status with the dropdown.
function BoardView({ applications, onStatusChange, updatingId }) {
  return (
    <div className="board">
      {STATUSES.map((status) => {
        const items = applications.filter((app) => app.status === status);
        return (
          <section className={`board-col board-col-${status.toLowerCase()}`} key={status}>
            <h3 className="board-col-title">
              {status} <span className="muted">({items.length})</span>
            </h3>

            {items.length === 0 && <p className="muted small">Nothing here</p>}

            {items.map((app) => (
              <div className="card" key={app._id}>
                <Link to={`/applications/${app._id}`} className="card-title">
                  {app.company}
                </Link>
                <div className="card-role">{app.role}</div>
                <div className="card-meta">
                  Applied {formatDate(app.appliedDate)}
                  <FollowUpLabel application={app} />
                </div>
                <StatusSelect
                  value={app.status}
                  disabled={updatingId === app._id}
                  onChange={(newStatus) => onStatusChange(app._id, newStatus)}
                />
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}

export default BoardView;
