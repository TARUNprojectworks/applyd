import { needsFollowUp } from '../utils/helpers';

// Shows "Follow up" only when the application needs it (see needsFollowUp in helpers.js)
function FollowUpLabel({ application }) {
  if (!needsFollowUp(application)) return null;
  return (
    <span className="followup" title="Still 'Applied' after 7 days">
      Follow up
    </span>
  );
}

export default FollowUpLabel;
