// Row of number cards at the top of the dashboard. "stats" comes from GET /api/applications/stats
function StatsCards({ stats }) {
  const cards = [
    { label: 'Total', value: stats.total },
    { label: 'Applied', value: stats.Applied },
    { label: 'Interview', value: stats.Interview },
    { label: 'Offer', value: stats.Offer },
    { label: 'Rejected', value: stats.Rejected },
    { label: 'Response rate', value: `${stats.responseRate}%` },
  ];

  return (
    <div className="stats">
      {cards.map((card) => (
        <div className="stat-card" key={card.label}>
          <div className="stat-label">{card.label}</div>
          <div className="stat-value">{card.value}</div>
        </div>
      ))}
    </div>
  );
}

export default StatsCards;
