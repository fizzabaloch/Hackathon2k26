const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export async function resolveCase(query, language = 'auto') {
  const res = await fetch(`${API}/api/v1/resolve-case`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, language }),
  });
  return res.json();
}

export async function getChecklist(serviceId) {
  const res = await fetch(`${API}/api/v1/checklist/${serviceId}`);
  return res.json();
}

export async function getJourney(serviceId) {
  const res = await fetch(`${API}/api/v1/journey/${serviceId}`);
  return res.json();
}

export async function validateForm(serviceId, fields) {
  const res = await fetch(`${API}/api/v1/form-doctor/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ service_id: serviceId, fields }),
  });
  return res.json();
}

export async function getCenters(city = '') {
  const url = city ? `${API}/api/v1/centers?city=${encodeURIComponent(city)}` : `${API}/api/v1/centers`;
  const res = await fetch(url);
  return res.json();
}

export async function trackApplication(trackingId) {
  const res = await fetch(`${API}/api/v1/track/${trackingId}`);
  return res.json();
}

export async function getDemoIds() {
  const res = await fetch(`${API}/api/v1/demo-tracking-ids`);
  return res.json();
}

export async function getServices() {
  const res = await fetch(`${API}/api/v1/services`);
  return res.json();
}

export async function healthCheck() {
  const res = await fetch(`${API}/api/v1/health`);
  return res.json();
}

export async function getQueueBoard() {
  const res = await fetch(`${API}/api/v1/queue/board`);
  return res.json();
}

export async function issueToken(payload) {
  const res = await fetch(`${API}/api/v1/queue/issue-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function advanceQueue(counterId = 2) {
  const res = await fetch(`${API}/api/v1/queue/advance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ counter_id: counterId }),
  });
  return res.json();
}

export async function auditFormDocument(payload) {
  const res = await fetch(`${API}/api/v1/form-doctor/audit-document`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}
