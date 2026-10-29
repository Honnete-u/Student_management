import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { SUBJECTS, average, fmt, letter, status } from '../utils';

export default function StudentDetails() {
  const { id } = useParams();
  const [s, setS] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.student(id).then(setS).catch((e) => setError(e.message)); }, [id]);

  if (error) return <div className="alert err">{error} <Link to="/students">Back to students</Link></div>;
  if (!s) return <p>Loading…</p>;
  const avg = average(s);
  const st = status(s);

  return (
    <>
      <div className="row between">
        <div><h2>{s.name}</h2><p className="muted">{s.id} · {s.grade}</p></div>
        <Link className="btn primary" to={`/students/${s.id}/edit`}>Edit student</Link>
      </div>
      <div className="two-col">
        <section className="card">
          <h3>Contact</h3>
          <p>{s.email}</p><p>{s.phone}</p>
        </section>
        <section className="card">
          <h3>Performance</h3>
          <p><strong>{fmt(avg)}</strong> average {letter(avg) && `· grade ${letter(avg)}`}</p>
          <span className={`pill ${st === 'Pass' ? 'good' : st === 'Fail' ? 'bad' : ''}`}>{st}</span>
        </section>
      </div>
      <section className="card">
        <h3>Subject marks</h3>
        <table>
          <tbody>
            {SUBJECTS.map((sub) => (
              <tr key={sub}><td>{sub}</td><td>{s.marks[sub] ?? '—'}</td></tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
