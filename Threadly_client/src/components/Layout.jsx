import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { HomeIcon, SearchIcon, UserIcon, ShieldIcon, LogoutIcon } from "./Icons";
import Avatar from "./Avatar";

function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user.role === "role-admin";

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <NavLink to="/" className="logo-link" aria-label="Threadly home">
          <span className="logo-mark">T</span>
          <span className="logo-text nav-label">Threadly</span>
        </NavLink>

        <nav className="sidebar-nav">
          <NavLink to="/" end className="nav-item">
            <HomeIcon />
            <span className="nav-label">Home</span>
          </NavLink>
          <NavLink to="/search" className="nav-item">
            <SearchIcon />
            <span className="nav-label">Search</span>
          </NavLink>
          <NavLink to={`/profile/${user.id}`} className="nav-item">
            <UserIcon />
            <span className="nav-label">Profile</span>
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className="nav-item">
              <ShieldIcon />
              <span className="nav-label">Admin</span>
            </NavLink>
          )}
          <button className="nav-item" onClick={handleLogout}>
            <LogoutIcon />
            <span className="nav-label">Log out</span>
          </button>
        </nav>

        <div className="sidebar-user">
          <Avatar user={user} />
          <div className="sidebar-user-text nav-label">
            <strong>{user.username}</strong>
            <span>@{user.username}</span>
          </div>
        </div>
      </aside>

      <main className="main-column">
        <Outlet />
      </main>

      <aside className="right-panel">
        <div className="panel-card">
          <h2>About Threadly</h2>
          <p>
            A small place to post short threads, follow people, like and
            retweet. Use Search to find people and threads.
          </p>
        </div>
        <p className="panel-footer">Threadly · Built for learning</p>
      </aside>
    </div>
  );
}

export default Layout;