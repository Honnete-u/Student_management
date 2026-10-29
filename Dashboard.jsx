import { Link } from 'react-router-dom';
import { useStudents } from '../hooks';
import { summarize, fmt } from '../utils';
import Stat from '../components/Stat';
import BarChart from '../components/BarChart';

export default function Dashboard() {
  const { students, loading, error } = useStudents();
  if (loading) return <p>Loading…</p>;
  if (error) return <div className="alert err">{error}</div>;
  const s = summarize(students);
  const recent = [...students].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  return (
    <>
      <h2>Dashboard</h2>
      <div className="stats">
        <Stat label="Total students" value={s.total} />
        <Stat label="Passed" value={s.passed} tone="good" />
        <Stat label="Failed" value={s.failed} tone="bad" />
        <Stat label="Average score" value={fmt(s.average)} />
      </div>
      <div className="two-col">
        <section className="card">
          <h3>Grade distribution</h3>
          <BarChart data={s.distribution} />
        </section>
        <section className="card">
          <h3>Recently registered</h3>
          {recent.length === 0 ? (
            <p className="muted">No students yet. <Link to="/students/new">Add the first one.</Link></p>
          ) : (
            <ul className="plain">
              {recent.map((st) => (
                <li key={st.id}>
                  <Link to={`/students/${st.id}`}>{st.name}</Link>
                  <span className="muted">{st.grade} · {new Date(st.createdAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
