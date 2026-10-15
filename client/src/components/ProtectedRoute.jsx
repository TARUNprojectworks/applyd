import { Navigate } from 'react-router-dom';

// Wraps pages that need a login. No token -> redirect to the login page.
// (The backend still checks the token on every request; this is only for the UI.)
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default ProtectedRoute;
