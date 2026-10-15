import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ApplicationForm from './pages/ApplicationForm';
import ApplicationDetail from './pages/ApplicationDetail';

// All the pages of the app. Pages wrapped in ProtectedRoute need a login.
function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications/new"
            element={
              <ProtectedRoute>
                <ApplicationForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications/:id"
            element={
              <ProtectedRoute>
                <ApplicationDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications/:id/edit"
            element={
              <ProtectedRoute>
                <ApplicationForm />
              </ProtectedRoute>
            }
          />
          {/* Unknown URL -> go to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
