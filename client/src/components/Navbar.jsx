import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Plain top bar: app name on the left, user name + Logout on the right
function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link to="/" className="brand">
          Applyd
        </Link>
        {user && (
          <div className="topbar-user">
            <span>{user.name}</span>
            <button className="btn btn-small" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
