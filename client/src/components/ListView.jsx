import { Link } from 'react-router-dom';
import StatusSelect from './StatusSelect';
import FollowUpLabel from './FollowUpLabel';
import { formatDate } from '../utils/helpers';

// Spreadsheet-like table of applications
function ListView({ applications, onStatusChange, updatingId }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Role</th>
            <th>Location</th>
            <th>Applied</th>
            <th>Interview</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app._id}>
              <td>
                <Link to={`/applications/${app._id}`}>{app.company}</Link>
                <FollowUpLabel application={app} />
              </td>
              <td>{app.role}</td>
              <td>{app.location || '-'}</td>
              <td className="nowrap">{formatDate(app.appliedDate)}</td>
              <td className="nowrap">{formatDate(app.interviewDate)}</td>
              <td>
                <StatusSelect
                  value={app.status}
                  disabled={updatingId === app._id}
                  onChange={(status) => onStatusChange(app._id, status)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ListView;
