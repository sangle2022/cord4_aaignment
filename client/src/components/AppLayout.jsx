import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function userInitials(email) {
  if (!email) {
    return '?';
  }
  const part = email.split('@')[0] || email;
  return part.slice(0, 2).toUpperCase();
}

export function AppLayout({ title, description, children }) {
  const { user, logout } = useAuth();
  return (
    <>
      <header className="topbar">
        <div className="topbar__brand">
          <Link to="/payouts" className="brand">
            <span className="brand__mark" aria-hidden>
              ₹
            </span>
            <span>Payout Desk</span>
          </Link>
          <nav className="nav" aria-label="Main">
            <NavLink
              to="/payouts"
              className={({ isActive }) =>
                isActive ? 'nav-link nav-link--active' : 'nav-link'
              }
              end
            >
              Payouts
            </NavLink>
            <NavLink
              to="/vendors"
              className={({ isActive }) =>
                isActive ? 'nav-link nav-link--active' : 'nav-link'
              }
            >
              Vendors
            </NavLink>
            {user?.role === 'OPS' ? (
              <NavLink
                to="/payouts/new"
                className={({ isActive }) =>
                  isActive ? 'nav-link nav-link--active' : 'nav-link'
                }
              >
                New payout
              </NavLink>
            ) : null}
          </nav>
        </div>
        <div className="topbar__user">
          <div className="user-chip">
            <span className="user-chip__avatar">{userInitials(user?.email)}</span>
            <div className="user-chip__meta">
              <span className="user-chip__email" title={user?.email}>
                {user?.email}
              </span>
              <span className="user-chip__role">{user?.role}</span>
            </div>
          </div>
          <button type="button" className="btn secondary" onClick={logout}>
            Log out
          </button>
        </div>
      </header>
      <main className="container">
        {title ? <h1 className="page-heading">{title}</h1> : null}
        {description ? <p className="page-desc">{description}</p> : null}
        {children}
      </main>
    </>
  );
}
