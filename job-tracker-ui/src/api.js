const BASE_URL = 'http://localhost:8080';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  // DELETE returns 204 No Content
  if (res.status === 204) return null;
  return res.json();
}

// ---- Applications ----
export function getApplications(status, company) {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (company) params.append('company', company);
  const query = params.toString();
  return request(`/applications${query ? '?' + query : ''}`);
}

export function getApplication(id) {
  return request(`/applications/${id}`);
}

export function createApplication(data) {
  return request('/applications', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateApplication(id, data) {
  return request(`/applications/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteApplication(id) {
  return request(`/applications/${id}`, { method: 'DELETE' });
}

// ---- Stats ----
export function getStats() {
  return request('/applications/stats');
}

// ---- Status History ----
export function getHistory(id) {
  return request(`/applications/${id}/history`);
}

// ---- Follow-ups ----
export function getFollowUpsForApp(appId) {
  return request(`/applications/${appId}/follow-ups`);
}

export function createFollowUp(appId, data) {
  return request(`/applications/${appId}/follow-ups`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getDueThisWeek() {
  return request('/follow-ups/due-this-week');
}

export function getOverdue() {
  return request('/follow-ups/overdue');
}

export function markFollowUpComplete(id) {
  return request(`/follow-ups/${id}/complete`, { method: 'PUT' });
}
