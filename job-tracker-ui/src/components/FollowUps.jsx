import { useState } from 'react';
import { markFollowUpComplete, createFollowUp } from '../api';

function FollowUps({ applications, dueThisWeek, overdue, onRefresh }) {
  const [newAppId, setNewAppId] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newDate, setNewDate] = useState('');

  const handleComplete = async (id) => {
    try {
      await markFollowUpComplete(id);
      await onRefresh();
    } catch (err) {
      console.error('Failed to complete:', err);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newAppId || !newNote.trim() || !newDate) return;
    try {
      await createFollowUp(newAppId, { dueDate: newDate, note: newNote });
      setNewNote('');
      setNewDate('');
      setNewAppId('');
      await onRefresh();
    } catch (err) {
      console.error('Failed to add follow-up:', err);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Follow-ups</h1>
        <p>Stay on top of your pending actions</p>
      </div>

      {/* Add New Follow-up */}
      <div className="dashboard-card" style={{ marginBottom: 24 }}>
        <h3>Add Follow-up</h3>
        <form className="add-followup-form" onSubmit={handleAdd}>
          <select
            value={newAppId}
            onChange={(e) => setNewAppId(e.target.value)}
            required
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              padding: '7px 10px',
              borderRadius: 'var(--radius)',
              fontSize: '0.82rem',
              minWidth: 180,
            }}
          >
            <option value="">Select application...</option>
            {applications.map((app) => (
              <option key={app.id} value={app.id}>
                {app.companyName} — {app.roleTitle}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Follow-up note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            required
          />
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary btn-sm">Add</button>
        </form>
      </div>

      {/* Overdue */}
      <div className="followups-section">
        <h2>
          Overdue
          {overdue.length > 0 && <span className="section-count" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>{overdue.length}</span>}
        </h2>
        {overdue.length === 0 ? (
          <div className="empty-state" style={{ padding: 24 }}>
            <p>No overdue follow-ups. You're on track!</p>
          </div>
        ) : (
          overdue.map((fu) => (
            <div key={fu.id} className="followup-card overdue">
              <div className="followup-info">
                <div className="followup-note">{fu.note}</div>
                <div className="followup-meta">
                  <span className="followup-company">{fu.application?.companyName}</span>
                  {' · '}
                  <span className="followup-date" style={{ color: '#ef4444' }}>{fu.dueDate}</span>
                </div>
              </div>
              <div className="followup-actions">
                <button className="btn-secondary btn-sm" onClick={() => handleComplete(fu.id)}>
                  Mark Done
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Due This Week */}
      <div className="followups-section">
        <h2>
          Due This Week
          {dueThisWeek.length > 0 && <span className="section-count">{dueThisWeek.length}</span>}
        </h2>
        {dueThisWeek.length === 0 ? (
          <div className="empty-state" style={{ padding: 24 }}>
            <p>Nothing due this week.</p>
          </div>
        ) : (
          dueThisWeek.map((fu) => (
            <div key={fu.id} className="followup-card">
              <div className="followup-info">
                <div className="followup-note">{fu.note}</div>
                <div className="followup-meta">
                  <span className="followup-company">{fu.application?.companyName}</span>
                  {' · '}
                  <span className="followup-date">{fu.dueDate}</span>
                </div>
              </div>
              <div className="followup-actions">
                <button className="btn-secondary btn-sm" onClick={() => handleComplete(fu.id)}>
                  Mark Done
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default FollowUps;
