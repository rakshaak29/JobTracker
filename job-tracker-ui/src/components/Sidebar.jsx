function Sidebar({ activeTab, onTabChange }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '◫' },
    { id: 'applications', label: 'Applications', icon: '◉' },
    { id: 'followups', label: 'Follow-ups', icon: '⏱' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>Job<span>Tracker</span></h2>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-nav-item ${activeTab === item.id || (activeTab === 'detail' && item.id === 'applications') ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <p>Job Tracker v1.0</p>
      </div>
    </aside>
  );
}

export default Sidebar;
