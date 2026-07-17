import { useState } from 'react';
import StatusBadge from './StatusBadge';
import ApplicationModal from './ApplicationModal';
import { getApplications, deleteApplication } from '../api';

const STATUSES = ['', 'APPLIED', 'PHONE_SCREEN', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN'];

function Applications({ applications: initialApps, onRefresh, onSelectApp }) {
  const [apps, setApps] = useState(initialApps);
  const [statusFilter, setStatusFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleFilter = async () => {
    try {
      const filtered = await getApplications(statusFilter || undefined, companyFilter || undefined);
      setApps(filtered);
    } catch (err) {
      console.error('Filter failed:', err);
    }
  };

  const onStatusChange = (val) => {
    setStatusFilter(val);
    setTimeout(async () => {
      const filtered = await getApplications(val || undefined, companyFilter || undefined);
      setApps(filtered);
    }, 0);
  };

  const onCompanyChange = (val) => {
    setCompanyFilter(val);
  };

  const handleCompanyKeyDown = (e) => {
    if (e.key === 'Enter') handleFilter();
  };

  const handleEdit = (e, app) => {
    e.stopPropagation();
    setEditingApp(app);
    setShowModal(true);
  };

  const handleDelete = async (e, app) => {
    e.stopPropagation();
    setDeleteConfirm(app);
  };

  const confirmDelete = async () => {
    try {
      await deleteApplication(deleteConfirm.id);
      setDeleteConfirm(null);
      await onRefresh();
      const filtered = await getApplications(statusFilter || undefined, companyFilter || undefined);
      setApps(filtered);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingApp(null);
  };

  const handleModalSave = async () => {
    setShowModal(false);
    setEditingApp(null);
    await onRefresh();
    const filtered = await getApplications(statusFilter || undefined, companyFilter || undefined);
    setApps(filtered);
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Applications</h1>
        <p>Track and manage all your job applications</p>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="">All Statuses</option>
          {STATUSES.filter(Boolean).map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search by company..."
          value={companyFilter}
          onChange={(e) => onCompanyChange(e.target.value)}
          onKeyDown={handleCompanyKeyDown}
        />
        <button className="btn-secondary btn-sm" onClick={handleFilter}>Search</button>
        <div className="filter-spacer" />
        <button className="btn-primary" onClick={() => { setEditingApp(null); setShowModal(true); }}>
          + New Application
        </button>
      </div>

      {/* Table */}
      {apps.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <p>No applications found. Add your first one!</p>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            + New Application
          </button>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Role</th>
              <th>Status</th>
              <th>Applied</th>
              <th>Source</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {apps.map((app) => (
              <tr key={app.id} onClick={() => onSelectApp(app)}>
                <td className="col-company">{app.companyName}</td>
                <td>{app.roleTitle}</td>
                <td><StatusBadge status={app.status} /></td>
                <td>{app.dateApplied}</td>
                <td>{app.source || '—'}</td>
                <td>
                  <div className="col-actions">
                    <button className="btn-icon" onClick={(e) => handleEdit(e, app)} title="Edit">
                      ✎
                    </button>
                    <button className="btn-icon btn-danger" onClick={(e) => handleDelete(e, app)} title="Delete">
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <ApplicationModal
          application={editingApp}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 400 }}>
            <div className="modal-header">
              <h2>Delete Application</h2>
              <button className="btn-icon" onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="confirm-text">
                Are you sure you want to delete the application for <strong>{deleteConfirm.roleTitle}</strong> at <strong>{deleteConfirm.companyName}</strong>?
              </p>
              <p className="confirm-text">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button
                className="btn-primary"
                style={{ background: '#ef4444' }}
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Applications;
