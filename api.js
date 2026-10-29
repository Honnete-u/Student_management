// All HTTP calls live here so pages stay simple.
async function request(url, options = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch('/api' + url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && token) { localStorage.clear(); window.location.href = '/login'; }
  if (!res.ok) throw Object.assign(new Error(data.message || 'Something went wrong.'), { errors: data.errors });
  return data;
}
export const api = {
  login: (b) => request('/login', { method: 'POST', body: JSON.stringify(b) }),
  register: (b) => request('/register', { method: 'POST', body: JSON.stringify(b) }),
  students: () => request('/students'),
  student: (id) => request('/students/' + id),
  addStudent: (b) => request('/students', { method: 'POST', body: JSON.stringify(b) }),
  updateStudent: (id, b) => request('/students/' + id, { method: 'PUT', body: JSON.stringify(b) }),
  deleteStudent: (id) => request('/students/' + id, { method: 'DELETE' }),
};
