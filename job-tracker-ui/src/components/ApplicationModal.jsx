import { useState } from 'react';
import { createApplication, updateApplication } from '../api';

const STATUSES = ['APPLIED', 'PHONE_SCREEN', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN'];

function ApplicationModal({ application, onClose, onSave }) {
  const isEditing = !!application;

  const [form, setForm] = useState({
    companyName: application?.companyName || '',
    roleTitle: application?.roleTitle || '',
    status: application?.status || 'APPLIED',
    dateApplied: application?.dateApplied || new Date().toISOString().split('T')[0],
    source: application?.source || '',
    jobPostingUrl: application?.jobPostingUrl || '',
    notes: application?.notes || '',
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.companyName.trim() || !form.roleTitle.trim()) return;

    setSaving(true);
    try {
      if (isEditing) {
        await updateApplication(application.id, form);
      } else {
        await createApplication(form);
      }
      onSave();
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Application' : 'New Application'}</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label>Company Name *</label>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role Title *</label>
                <input
                  type="text"
                  value={form.roleTitle}
                  onChange={(e) => handleChange('roleTitle', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date Applied</label>
                <input
                  type="date"
                  value={form.dateApplied}
                  onChange={(e) => handleChange('dateApplied', e.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Source</label>
                <input
                  type="text"
                  placeholder="e.g. LinkedIn, Referral"
                  value={form.source}
                  onChange={(e) => handleChange('source', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Job Posting URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={form.jobPostingUrl}
                  onChange={(e) => handleChange('jobPostingUrl', e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                placeholder="Any additional notes..."
                value={form.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ApplicationModal;
