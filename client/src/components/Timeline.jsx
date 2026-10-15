import StatusBadge from './StatusBadge';
import { formatDateTime } from '../utils/helpers';

// Vertical list of status changes, oldest first. "history" = application.statusHistory
function Timeline({ history }) {
  if (!history || history.length === 0) {
    return <p className="muted">No history yet.</p>;
  }

  return (
    <ol className="timeline">
      {history.map((entry, index) => (
        <li className="timeline-item" key={index}>
          <StatusBadge status={entry.status} />
          <span className="timeline-date">{formatDateTime(entry.changedAt)}</span>
        </li>
      ))}
    </ol>
  );
}

export default Timeline;
