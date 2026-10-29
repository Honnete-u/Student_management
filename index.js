const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB = path.join(__dirname, 'data.json');
const SECRET = process.env.SECRET || 'dev-secret-change-me';
const SUBJECTS = ['Mathematics', 'English', 'Science', 'Social Studies'];

// ---- tiny JSON-file "database" ----
const load = () => (fs.existsSync(DB) ? JSON.parse(fs.readFileSync(DB, 'utf8')) : { users: [], students: [] });
const save = (d) => fs.writeFileSync(DB, JSON.stringify(d, null, 2));

// ---- passwords are hashed with scrypt (never stored in plain text) ----
const hash = (pw, salt = crypto.randomBytes(16).toString('hex')) =>
  salt + ':' + crypto.scryptSync(pw, salt, 64).toString('hex');
const verify = (pw, stored) => {
  const [salt, h] = stored.split(':');
  return crypto.timingSafeEqual(Buffer.from(h, 'hex'), crypto.scryptSync(pw, salt, 64));
};

// ---- signed tokens (simple stand-in for JWT) ----
const sign = (payload) => {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return body + '.' + crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
};
const unsign = (token = '') => {
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const good = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  if (sig.length !== good.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good))) return null;
  const p = JSON.parse(Buffer.from(body, 'base64url').toString());
  return p.exp > Date.now() ? p : null;
};
const auth = (req, res, next) => {
  const p = unsign((req.headers.authorization || '').replace('Bearer ', ''));
  if (!p) return res.status(401).json({ message: 'Please log in again.' });
  req.user = p;
  next();
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateStudent(b, students, ignoreId) {
  const errors = {};
  if (!b.name || b.name.trim().length < 2) errors.name = 'Full name is required (min 2 characters).';
  if (!b.email || !EMAIL.test(b.email)) errors.email = 'Enter a valid email address.';
  else if (students.some((s) => s.email.toLowerCase() === b.email.toLowerCase() && s.id !== ignoreId))
    errors.email = 'A student with this email already exists.';
  if (!b.phone || !/^[+\d][\d\s-]{6,}$/.test(b.phone)) errors.phone = 'Enter a valid phone number.';
  if (!b.grade) errors.grade = 'Select a grade or class.';
  SUBJECTS.forEach((s) => {
    const v = b.marks?.[s];
    if (v !== '' && v !== null && v !== undefined && (isNaN(v) || v < 0 || v > 100))
      errors['mark_' + s] = 'Marks must be between 0 and 100.';
  });
  return errors;
}
const clean = (b) => ({
  name: b.name.trim(),
  email: b.email.trim().toLowerCase(),
  phone: b.phone.trim(),
  grade: b.grade,
  marks: Object.fromEntries(
    SUBJECTS.filter((s) => b.marks?.[s] !== '' && b.marks?.[s] != null).map((s) => [s, Number(b.marks[s])])
  ),
});

const app = express();
app.use(cors());
app.use(express.json());

// ---- auth ----
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !EMAIL.test(email || '') || (password || '').length < 6)
    return res.status(400).json({ message: 'Name, a valid email and a password of 6+ characters are required.' });
  const db = load();
  if (db.users.some((u) => u.email === email.toLowerCase()))
    return res.status(409).json({ message: 'An account with this email already exists.' });
  const user = { id: Date.now(), name: name.trim(), email: email.toLowerCase(), password: hash(password) };
  db.users.push(user);
  save(db);
  res.status(201).json({ message: 'Account created. You can log in now.' });
});

app.post('/api/login', (req, res) => {
  const { email = '', password = '' } = req.body;
  const user = load().users.find((u) => u.email === email.toLowerCase());
  if (!user || !verify(password, user.password))
    return res.status(401).json({ message: 'Incorrect email or password.' });
  const token = sign({ id: user.id, exp: Date.now() + 8 * 3600 * 1000 });
  res.json({ token, user: { name: user.name, email: user.email } });
});

// ---- students (CRUD) ----
app.get('/api/students', auth, (req, res) => res.json(load().students));

app.get('/api/students/:id', auth, (req, res) => {
  const s = load().students.find((x) => x.id === req.params.id);
  s ? res.json(s) : res.status(404).json({ message: 'Student not found.' });
});

app.post('/api/students', auth, (req, res) => {
  const db = load();
  const errors = validateStudent(req.body, db.students);
  if (Object.keys(errors).length) return res.status(400).json({ message: 'Please fix the highlighted fields.', errors });
  const n = db.students.reduce((m, s) => Math.max(m, parseInt(s.id.split('-')[1])), 0) + 1;
  const student = { id: 'STU-' + String(n).padStart(3, '0'), ...clean(req.body), createdAt: new Date().toISOString() };
  db.students.push(student);
  save(db);
  res.status(201).json(student);
});

app.put('/api/students/:id', auth, (req, res) => {
  const db = load();
  const i = db.students.findIndex((x) => x.id === req.params.id);
  if (i < 0) return res.status(404).json({ message: 'Student not found.' });
  const errors = validateStudent(req.body, db.students, req.params.id);
  if (Object.keys(errors).length) return res.status(400).json({ message: 'Please fix the highlighted fields.', errors });
  db.students[i] = { ...db.students[i], ...clean(req.body) };
  save(db);
  res.json(db.students[i]);
});

app.delete('/api/students/:id', auth, (req, res) => {
  const db = load();
  const before = db.students.length;
  db.students = db.students.filter((x) => x.id !== req.params.id);
  if (db.students.length === before) return res.status(404).json({ message: 'Student not found.' });
  save(db);
  res.json({ message: 'Student deleted.' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
