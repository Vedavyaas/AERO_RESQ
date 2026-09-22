import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ShieldAlert, Activity, User } from 'lucide-react';
import api from '../api/axiosConfig';

const UserPortal = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/user/');
        if (response.data.role !== 'USER') {
          setError('Unauthorized: You do not have standard user access.');
        } else {
          setUserInfo(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch user info:', err);
        setError('Failed to load user data or session expired.');
        if (err.response && err.response.status === 401) {
          navigate('/'); 
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex-center">
        <div className="text-center">
          <div className="flex-center mb-4"><Activity className="animate-spin" size={40} color="var(--primary)" /></div>
          <p>Loading User Portal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex-center p-4">
        <div className="glass-panel p-8 text-center max-w-md">
          <ShieldAlert size={48} color="var(--danger)" className="mb-4 mx-auto" />
          <h2 className="mb-4 text-white">Access Denied</h2>
          <p className="mb-6">{error}</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">Return Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 animate-fade-in">
      {/* Top Navbar */}
      <nav className="glass-panel mb-8 p-4 flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '0.5rem', borderRadius: '8px' }}>
             <User size={24} color="#10b981" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'white' }}>User Portal</h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Welcome, {userInfo?.username}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-outline" style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem 1rem' }}>
          <LogOut size={18} /> Logout
        </button>
      </nav>

      {/* Main Content Area */}
      <div className="glass-panel p-8 text-center">
        <h3 className="mb-4">User Dashboard</h3>
        <p>This is a placeholder for User features such as requesting drone missions and viewing status.</p>
      </div>
    </div>
  );
};

export default UserPortal;
