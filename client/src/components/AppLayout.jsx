import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function AppLayout({ title, children }) {
  const { user, logout } = useAuth();
  return (
    <>
      <header className="topbar">
        <nav className="nav">
          <Link to="/payouts">Payouts</Link>
          <Link to="/vendors">Vendors</Link>
          {user?.role === 'OPS' ? <Link to="/payouts/new">New payout</Link> : null}
        </nav>
        <div className="row">
          <span className="muted">
            {user?.email} · <strong>{user?.role}</strong>
          </span>
          <button type="button" className="btn secondary" onClick={logout}>
            Log out
          </button>
        </div>
      </header>
      <main className="container">
        {title ? <h1>{title}</h1> : null}
        {children}
      </main>
    </>
  );
}
