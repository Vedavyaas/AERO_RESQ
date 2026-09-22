import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, KeyRound, Drone } from 'lucide-react';
import api from '../api/axiosConfig';

const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/user/authenticate', { username, password });

      const { token } = response.data;
      if (token) {
        localStorage.setItem('jwt_token', token);
        const userResponse = await api.get('/user/');
        const userRole = userResponse.data.role;

        if (userRole === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/user');
        }
      } else {
        setError('No token received. Authentication failed.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid credentials or server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex-center p-4 fade-up">
      <div className="win" style={{ display: 'flex', width: '100%', maxWidth: '900px', minHeight: '500px' }}>

        {/* Left Branding Section */}
        <div style={{ flex: 1, padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'rgba(59,130,246,0.03)', borderRight: '1px solid var(--border-side)' }}>
          <div className="flex-center mb-6" style={{ height: '72px', width: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(217,119,6,0.1) 100%)', boxShadow: '0 4px 20px rgba(59,130,246,0.15)' }}>
            <Drone size={36} color="var(--blue-l)" />
          </div>
          <h1 className="page-title mb-4" style={{ fontSize: '2.5rem', background: '-webkit-linear-gradient(45deg, var(--blue), var(--gold-l))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AERO-RESQ
          </h1>
        </div>

        {/* Right Login Section */}
        <div style={{ flex: 1, padding: '3rem 4rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'rgba(255,255,255,0.4)' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--t1)', marginBottom: '0.5rem' }}>Welcome back</h2>
            <p style={{ color: 'var(--t2)', fontSize: '0.95rem' }}>Please enter your details to sign in.</p>
          </div>

          {error && (
            <div className="alert alert-error mb-4 fade-up" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="field">
              <label>Username</label>
              <div className="input-wrap">
                <User size={18} />
                <input
                  type="text"
                  className="fi"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label>Password</label>
              <div className="input-wrap">
                <KeyRound size={18} />
                <input
                  type="password"
                  className="fi"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ padding: '12px', marginTop: '0.5rem', fontSize: '1rem', width: '100%' }}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }}></div>
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Login;