import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import Field from '../components/Field';

export default function Login() {
  const nav = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const validate = () => {
    const e = {};
    if (mode === 'register' && !form.name.trim()) e.name = 'Enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address.';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters.';
    if (mode === 'register' && form.confirm !== form.password) e.confirm = 'Passwords do not match.';
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    try {
      if (mode === 'login') {
        const { token, user } = await api.login(form);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        nav('/');
      } else {
        const r = await api.register(form);
        setMessage({ type: 'ok', text: r.message });
        setMode('login');
      }
    } catch (err) {
      setMessage({ type: 'err', text: err.message });
    }
  };

  return (
    <div className="login">
      <form className="card login-card" onSubmit={submit} noValidate>
        <h1 className="brand">Schoolbook</h1>
        <p className="muted">{mode === 'login' ? 'Log in to manage your students.' : 'Create a staff account.'}</p>
        {message.text && <div className={`alert ${message.type}`}>{message.text}</div>}
        {mode === 'register' && (
          <Field label="Full name" error={errors.name}><input value={form.name} onChange={set('name')} /></Field>
        )}
        <Field label="Email address" error={errors.email}>
          <input type="email" value={form.email} onChange={set('email')} />
        </Field>
        <Field label="Password" error={errors.password}>
          <input type="password" value={form.password} onChange={set('password')} />
        </Field>
        {mode === 'register' && (
          <Field label="Confirm password" error={errors.confirm}>
            <input type="password" value={form.confirm} onChange={set('confirm')} />
          </Field>
        )}
        <button className="btn primary block">{mode === 'login' ? 'Log in' : 'Create account'}</button>
        <p className="muted center">
          {mode === 'login' ? 'New here? ' : 'Already registered? '}
          <button type="button" className="link" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErrors({}); setMessage({}); }}>
            {mode === 'login' ? 'Register' : 'Log in'}
          </button>
        </p>
      </form>
    </div>
  );
}
