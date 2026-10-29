import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useStudents } from '../hooks';

export default function StudentList() {
  const nav = useNavigate();
  const { students, loading, error, reload } = useStudents();
  const [q, setQ] = useState('');
  const [notice, setNotice] = useState('');

  const term = q.trim().toLowerCase();
  const shown = students.filter((s) => s.name.toLowerCase().includes(term) || s.email.toLowerCase().includes(term));

  const remove = async (s) => {
    if (!window.confirm(`Delete ${s.name}? This cannot be undone.`)) return;
    try { await api.deleteStudent(s.id); setNotice(`${s.name} was deleted.`); reload(); }
    catch (e) { setNotice(e.message); }
  };

  return (
    <>
      <div className="row between">
        <h2>Students</h2>
        <Link className="btn primary" to="/students/new">Add student</Link>
      </div>
      <input className="search" placeholder="Search by name or email" value={q} onChange={(e) => setQ(e.target.value)} />
      {notice && <div className="alert ok">{notice}</div>}
      {error && <div className="alert err">{error}</div>}
      <div className="card table-wrap">
        {loading ? <p>Loading…</p> : shown.length === 0 ? (
          <p className="muted">{students.length ? `No students match “${q}”.` : 'No students registered yet.'}</p>
        ) : (
          <table>
            <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Grade</th><th>Actions</th></tr></thead>
            <tbody>
              {shown.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td><Link to={`/students/${s.id}`}>{s.name}</Link></td>
                  <td>{s.email}</td><td>{s.phone}</td><td>{s.grade}</td>
                  <td className="actions">
                    <button className="btn small" onClick={() => nav(`/students/${s.id}/edit`)}>Edit</button>
                    <button className="btn small danger" onClick={() => remove(s)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
