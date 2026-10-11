const API_BASE = '/api';

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const headers = {
    Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : undefined,
    ...options.headers,
  };
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  } else {
    delete headers['Content-Type'];
  }

  const response = await fetch(`${API_BASE}${path}`, {
    headers,
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

export function registerCitizen(citizenData) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(citizenData),
  });
}

export function getCitizens() {
  return request('/citizens');
}

export function getCitizenById(id) {
  return request(`/citizens/${id}`);
}

export function updateCitizen(id, updates) {
  return request(`/citizens/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export function login(credentials) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export function getMe() {
  return request('/auth/me');
}

export function getDashboardData() {
  return request('/dashboard');
}

export function getRecommendedSchemes() {
  return request('/schemes/recommend');
}
export function getAllSchemes() {
  return request('/schemes');
}

// ── Documents ─────────────────────────────────────────────────────────────────
export function getDocumentsApi() {
  return request('/documents');
}

export function uploadDocumentApi(formData) {
  return request('/documents', {
    method: 'POST',
    body: formData,
  });
}

export function updateDocumentApi(id, formData) {
  return request(`/documents/${id}`, {
    method: 'PUT',
    body: formData,
  });
}

export function deleteDocumentApi(id) {
  return request(`/documents/${id}`, {
    method: 'DELETE',
  });
}

export function getDocumentFileUrl(id, download = false) {
  const token = localStorage.getItem('token');
  return `${API_BASE}/documents/${id}/file?download=${download}${token ? `&token=${token}` : ''}`;
}

/** Trigger server-side data extraction for a document */
export function extractDocumentDataApi(id) {
  return request(`/documents/${id}/extract`, { method: 'POST' });
}

/** Get aggregated profile data extracted from all user documents */
export function getExtractedProfileApi() {
  return request('/documents/extracted-profile');
}

// ── Schemes ───────────────────────────────────────────────────────────────────
export function simulateEligibilityApi(payload) {
  return request('/schemes/simulate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
