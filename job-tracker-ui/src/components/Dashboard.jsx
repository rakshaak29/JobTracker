import StatusBadge from './StatusBadge';

const STATUS_COLORS = {
  APPLIED: '#f59e0b',
  PHONE_SCREEN: '#eab308',
  INTERVIEW: '#a855f7',
  OFFER: '#10b981',
  REJECTED: '#ef4444',
  WITHDRAWN: '#737373',
};

const STATUS_LABELS = {
  APPLIED: 'Applied',
  PHONE_SCREEN: 'Phone Screen',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
};

function Dashboard({ stats, applications, dueThisWeek, onSelectApp, onNavigate }) {
  const recentApps = [...applications]
    .sort((a, b) => new Date(b.dateApplied) - new Date(a.dateApplied))
    .slice(0, 5);

  const totalForBar = stats?.totalApplications || 0;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Your job search at a glance</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Applications</div>
          <div className="stat-value">{stats?.totalApplications ?? 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Response Rate</div>
          <div className="stat-value">
            {stats?.responseRate ?? 0}<span className="stat-unit">%</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg. Response Time</div>
          <div className="stat-value">
            {stats?.averageTimeToRespondDays ?? 0}<span className="stat-unit">days</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Follow-ups</div>
          <div className="stat-value">{dueThisWeek.length}</div>
        </div>
      </div>

      {/* Status Distribution */}
      {totalForBar > 0 && (
        <div className="distribution-section">
          <h3>Pipeline</h3>
          <div className="distribution-bar">
            {Object.entries(stats.statusCounts || {}).map(([status, count]) =>
              count > 0 ? (
                <div
                  key={status}
                  className="bar-segment"
                  style={{
                    width: `${(count / totalForBar) * 100}%`,
                    backgroundColor: STATUS_COLORS[status],
                  }}
                />
              ) : null
            )}
          </div>
          <div className="distribution-legend">
            {Object.entries(stats.statusCounts || {}).map(([status, count]) => (
              <div key={status} className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: STATUS_COLORS[status] }} />
                {STATUS_LABELS[status]}
                <span className="legend-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Grid */}
      <div className="dashboard-grid">
        {/* Recent Applications */}
        <div className="dashboard-card">
          <h3>Recent Applications</h3>
          {recentApps.length === 0 ? (
            <div className="empty-state">
              <p>No applications yet. Start tracking!</p>
              <button className="btn-primary btn-sm" onClick={() => onNavigate('applications')}>
                Add Application
              </button>
            </div>
          ) : (
            <table className="recent-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentApps.map((app) => (
                  <tr key={app.id} onClick={() => onSelectApp(app)} style={{ cursor: 'pointer' }}>
                    <td className="recent-company">{app.companyName}</td>
                    <td className="recent-role">{app.roleTitle}</td>
                    <td><StatusBadge status={app.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Upcoming Follow-ups */}
        <div className="dashboard-card">
          <h3>Due This Week</h3>
          {dueThisWeek.length === 0 ? (
            <div className="empty-state">
              <p>No follow-ups due this week.</p>
            </div>
          ) : (
            <div className="upcoming-list">
              {dueThisWeek.slice(0, 5).map((fu) => (
                <div key={fu.id} className="upcoming-item">
                  <div>
                    <div className="upcoming-note">{fu.note}</div>
                    <div className="upcoming-company">{fu.application?.companyName}</div>
                  </div>
                  <div className="upcoming-date">{fu.dueDate}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
