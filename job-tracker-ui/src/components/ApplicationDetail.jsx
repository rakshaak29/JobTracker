import { useState, useEffect } from 'react';
import StatusBadge from './StatusBadge';
import { getHistory, getFollowUpsForApp, createFollowUp, markFollowUpComplete } from '../api';

const STATUS_COLORS = {
  APPLIED: '#f59e0b',
  PHONE_SCREEN: '#eab308',
  INTERVIEW: '#a855f7',
  OFFER: '#10b981',
  REJECTED: '#ef4444',
  WITHDRAWN: '#737373',
};

function ApplicationDetail({ application, onBack, onRefresh }) {
  const [history, setHistory] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [newDate, setNewDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetail();
  }, [application.id]);

  const loadDetail = async () => {
    try {
      const [hist, fups] = await Promise.all([
        getHistory(application.id),
        getFollowUpsForApp(application.id),
      ]);
      setHistory(hist);
      setFollowUps(fups);
    } catch (err) {
      console.error('Failed to load detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFollowUp = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || !newDate) return;
    try {
      await createFollowUp(application.id, { dueDate: newDate, note: newNote });
      setNewNote('');
      setNewDate('');
      await loadDetail();
      await onRefresh();
    } catch (err) {
      console.error('Failed to add follow-up:', err);
    }
  };

  const handleComplete = async (id) => {
    try {
      await markFollowUpComplete(id);
      await loadDetail();
      await onRefresh();
    } catch (err) {
      console.error('Failed to complete follow-up:', err);
    }
  };

  const formatDateTime = (dt) => {
    if (!dt) return '';
    const d = new Date(dt);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="loading"><div className="spinner" /></div>;
  }

  return (
    <div className="fade-in">
      <button className="detail-back" onClick={onBack}>
        ← Back to Applications
      </button>

      {/* Header */}
      <div className="detail-header">
        <div className="detail-header-info">
          <h1>{application.companyName}</h1>
          <div className="detail-role">{application.roleTitle}</div>
          <div className="detail-meta">
            <div className="detail-meta-item">
              Applied: <span>{application.dateApplied}</span>
            </div>
            {application.source && (
              <div className="detail-meta-item">
                Source: <span>{application.source}</span>
              </div>
            )}
            {application.jobPostingUrl && (
              <div className="detail-meta-item">
                <a href={application.jobPostingUrl} target="_blank" rel="noopener noreferrer">
                  View Posting ↗
                </a>
              </div>
            )}
          </div>
        </div>
        <StatusBadge status={application.status} />
      </div>

      {/* Notes */}
      {application.notes && (
        <div className="detail-notes">
          {application.notes}
        </div>
      )}

      {/* Grid: Timeline + Follow-ups */}
      <div className="detail-grid">
        {/* Status History Timeline */}
        <div className="dashboard-card">
          <h3>Status History</h3>
          {history.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No history recorded.</p>
          ) : (
            <div className="timeline">
              {history.map((entry, idx) => (
                <div key={idx} className="timeline-item">
                  <div
                    className="timeline-dot"
                    style={{ backgroundColor: STATUS_COLORS[entry.newStatus] || '#737373' }}
                  />
                  <div className="timeline-content">
                    <span className="timeline-status">
                      {entry.oldStatus ? (
                        <>
                          {entry.oldStatus.replace('_', ' ')}
                          <span className="timeline-arrow">→</span>
                          {entry.newStatus.replace('_', ' ')}
                        </>
                      ) : (
                        entry.newStatus.replace('_', ' ')
                      )}
                    </span>
                    <span className="timeline-date">{formatDateTime(entry.changedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Follow-ups for this app */}
        <div className="detail-followups-card">
          <h3>Follow-ups</h3>
          {followUps.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No follow-ups set.</p>
          ) : (
            followUps.map((fu) => (
              <div
                key={fu.id}
                className={`detail-followup-item ${fu.completed ? 'detail-followup-completed' : ''}`}
              >
                <div>
                  <div className="detail-followup-note">{fu.note}</div>
                  <div className="detail-followup-date">{fu.dueDate}</div>
                </div>
                {!fu.completed && (
                  <button
                    className="btn-secondary btn-sm"
                    onClick={() => handleComplete(fu.id)}
                  >
                    Done
                  </button>
                )}
              </div>
            ))
          )}
          <form className="add-followup-form" onSubmit={handleAddFollowUp}>
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
      </div>
    </div>
  );
}

export default ApplicationDetail;
