import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';

function Register() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user) return <Navigate to="/" replace />;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Quick check on the client; the server checks again
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.token, res.data.user); // register also logs the user in
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-panel panel">
      <h1 className="page-title">Create account</h1>
      {error && <div className="alert">{error}</div>}
      <form onSubmit={handleSubmit} className="form">
        <label>
          Name
          <input type="text" name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password <span className="muted">(min 6 characters)</span>
          <input type="password" name="password" value={form.password} onChange={handleChange} required />
        </label>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating...' : 'Register'}
        </button>
      </form>
      <p className="small">
        Already registered? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}

export default Register;
