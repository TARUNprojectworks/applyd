// Small colored label for a status. The color comes from the CSS class, e.g. .badge-offer
function StatusBadge({ status }) {
  return <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>;
}

export default StatusBadge;
