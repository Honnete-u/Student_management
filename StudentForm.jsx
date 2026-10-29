import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { CLASSES, SUBJECTS } from '../utils';
import Field from '../components/Field';

const EMPTY = { name: '', email: '', phone: '', grade: '', marks: {} };

// Used for both "Add student" and "Edit student".
export default function StudentForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (id) api.student(id).then(setForm).catch((e) => setServerError(e.message));
  }, [id]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setMark = (s) => (e) => setForm({ ...form, marks: { ...form.marks, [s]: e.target.value } });

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Full name is required (min 2 characters).';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address.';
    if (!/^[+\d][\d\s-]{6,}$/.test(form.phone)) e.phone = 'Enter a valid phone number.';
    if (!form.grade) e.grade = 'Select a grade or class.';
    SUBJECTS.forEach((s) => {
      const v = form.marks[s];
      if (v !== '' && v != null && (isNaN(v) || v < 0 || v > 100)) e['mark_' + s] = 'Marks must be 0–100.';
    });
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    setServerError('');
    if (Object.keys(e).length) return;
    try {
      const saved = id ? await api.updateStudent(id, form) : await api.addStudent(form);
      nav(`/students/${saved.id}`);
    } catch (err) {
      setErrors(err.errors || {}); // e.g. duplicate email from the server
      setServerError(err.message);
    }
  };

  return (
    <>
      <h2>{id ? 'Edit student' : 'Add student'}</h2>
      <form className="card form" onSubmit={submit} noValidate>
        {serverError && <div className="alert err">{serverError}</div>}
        <div className="grid">
          <Field label="Full name" error={errors.name}><input value={form.name} onChange={set('name')} /></Field>
          <Field label="Email address" error={errors.email}><input type="email" value={form.email} onChange={set('email')} /></Field>
          <Field label="Phone number" error={errors.phone}><input value={form.phone} onChange={set('phone')} /></Field>
          <Field label="Grade or class" error={errors.grade}>
            <select value={form.grade} onChange={set('grade')}>
              <option value="">Select…</option>
              {CLASSES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
        </div>
        <h3>Subject marks (optional, 0–100)</h3>
        <div className="grid">
          {SUBJECTS.map((s) => (
            <Field key={s} label={s} error={errors['mark_' + s]}>
              <input type="number" min="0" max="100" value={form.marks[s] ?? ''} onChange={setMark(s)} />
            </Field>
          ))}
        </div>
        <div className="row">
          <button className="btn primary">Save student</button>
          <button type="button" className="btn" onClick={() => nav(-1)}>Cancel</button>
        </div>
      </form>
    </>
  );
}
