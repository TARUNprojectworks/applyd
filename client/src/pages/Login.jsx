import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';

function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Already logged in -> no need to see this page
  if (user) return <Navigate to="/" replace />;

  // One change handler for all inputs, uses the input's "name" attribute
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault(); // stop the browser from reloading the page
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user); // save token + user
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-panel panel">
      <h1 className="page-title">Log in</h1>
      {error && <div className="alert">{error}</div>}
      <form onSubmit={handleSubmit} className="form">
        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input type="password" name="password" value={form.password} onChange={handleChange} required />
        </label>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>
      <p className="small">
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}

export default Login;
