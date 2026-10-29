import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const links = [
  ['/', 'Dashboard'],
  ['/students', 'Students'],
  ['/students/new', 'Add student'],
  ['/reports', 'Reports'],
];

export default function Layout() {
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const logout = () => { localStorage.clear(); nav('/login'); };
  return (
    <div className="shell">
      <aside className="side">
        <h1 className="brand">Schoolbook</h1>
        <nav>
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/' || to === '/students'}>{label}</NavLink>
          ))}
        </nav>
        <div className="who">
          <span>{user.name}</span>
          <button className="btn ghost" onClick={logout}>Log out</button>
        </div>
      </aside>
      <main className="main"><Outlet /></main>
    </div>
  );
}
