import { useState } from 'react';
import { useStudents } from '../hooks';
import { CLASSES, SUBJECTS, summarize, fmt } from '../utils';
import Stat from '../components/Stat';
import BarChart from '../components/BarChart';

export default function Reports() {
  const { students, loading, error } = useStudents();
  const [cls, setCls] = useState('All');
  if (loading) return <p>Loading…</p>;
  if (error) return <div className="alert err">{error}</div>;

  const filtered = cls === 'All' ? students : students.filter((s) => s.grade === cls);
  const s = summarize(filtered);
  const subjectAvg = Object.fromEntries(SUBJECTS.map((sub) => {
    const v = filtered.map((x) => x.marks[sub]).filter((m) => m !== undefined);
    return [sub, v.length ? Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 10) / 10 : 0];
  }));

  return (
    <>
      <div className="row between">
        <h2>Reports</h2>
        <select value={cls} onChange={(e) => setCls(e.target.value)} aria-label="Filter by class">
          <option>All</option>
          {CLASSES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <p className="muted">Showing {cls === 'All' ? 'all classes' : cls}.</p>
      <div className="stats">
        <Stat label="Registered students" value={s.total} />
        <Stat label="Passed" value={s.passed} tone="good" />
        <Stat label="Failed" value={s.failed} tone="bad" />
        <Stat label="Average score" value={fmt(s.average)} />
      </div>
      <div className="two-col">
        <section className="card"><h3>Grade distribution</h3><BarChart data={s.distribution} /></section>
        <section className="card">
          <h3>Pass and fail</h3>
          <BarChart data={{ Passed: s.passed, Failed: s.failed }} colors={{ Passed: 'var(--good)', Failed: 'var(--bad)' }} />
          <h3>Average by subject</h3>
          <BarChart data={subjectAvg} />
        </section>
      </div>
    </>
  );
}
