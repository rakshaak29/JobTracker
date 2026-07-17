function StatusBadge({ status }) {
  const labels = {
    APPLIED: 'Applied',
    PHONE_SCREEN: 'Phone Screen',
    INTERVIEW: 'Interview',
    OFFER: 'Offer',
    REJECTED: 'Rejected',
    WITHDRAWN: 'Withdrawn',
  };

  return (
    <span className={`status-badge status-${status}`}>
      <span className="badge-dot" />
      {labels[status] || status}
    </span>
  );
}

export default StatusBadge;
