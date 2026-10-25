const API_BASE = '/api';
const SERVICE_UNAVAILABLE_MESSAGE = 'Unable to reach WelfareAI. Make sure the backend is running and connected to MongoDB, then try again.';

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

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers,
      cache: 'no-store',
      ...options,
    });
  } catch {
    throw new Error(SERVICE_UNAVAILABLE_MESSAGE);
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json().catch(() => ({})) : {};

  if (!response.ok) {
    if (response.status === 403 && path.startsWith('/documents')) {
      window.dispatchEvent(new Event('document-access-expired'));
    }
    throw new Error(data.message || (response.status >= 500
      ? SERVICE_UNAVAILABLE_MESSAGE
      : 'Request failed. Please check your details and try again.'));
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

export function verifyDocumentPassword(password) {
  return request('/auth/verify-password', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
}

export function lockDocumentAccess() {
  if (!localStorage.getItem('token')) return Promise.resolve(null);
  return request('/auth/document-access', { method: 'DELETE' }).catch(() => null);
}

export function getDashboardData() {
  return request('/dashboard');
}

export function getRecommendedSchemes() {
  return request('/schemes/recommend');
}
export function saveSchemeRecommendations(profile, schemes) {
  if (!localStorage.getItem('token')) return Promise.resolve(null);
  return request('/schemes/recommendations', {
    method: 'POST',
    body: JSON.stringify({ profile, schemes }),
  }).catch((error) => {
    console.warn('Could not save recommendation snapshot', error);
    return null;
  });
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

export async function getDocumentFileApi(id) {
  let response;
  try {
    response = await fetch(`${API_BASE}/documents/${id}/file`, {
      headers: {
        Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : undefined,
      },
    });
  } catch {
    throw new Error(SERVICE_UNAVAILABLE_MESSAGE);
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    if (response.status === 403) window.dispatchEvent(new Event('document-access-expired'));
    throw new Error(data.message || 'Could not open this document.');
  }
  return response.blob();
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
