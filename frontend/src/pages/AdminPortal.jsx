import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, User, Plus } from 'lucide-react';
import api from '../api/axiosConfig';
import UserManagement from '../components/UserManagement';
import UserProfile from '../components/UserProfile';

const AdminPortal = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('view-users');

  useEffect(() => {
    // 1. Check token presence
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'ADMIN') {
      navigate('/login');
      return;
    }

    // 2. Fetch User Profile to verify identity and get details
    const fetchProfile = async () => {
      try {
        const res = await api.get('/user');
        setUserInfo(res.data);
      } catch (err) {
        console.error('Failed to fetch profile', err);
        // If 403 or 401, token might be invalid
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
           localStorage.removeItem('token');
           localStorage.removeItem('role');
           navigate('/login');
        }
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex" style={{ display: 'flex', minHeight: '100vh' }}>
      
      {/* Sidebar Area */}
      <aside className="glass-card" style={{ width: '280px', margin: '1rem', display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid var(--border-side)' }}>
          <h1 style={{ fontSize: '1.2rem', fontWeight: '800', letterSpacing: '0.05em', color: 'var(--blue)' }}>
            AERO-RESQ
          </h1>
          <div className="badge badge-admin" style={{ marginTop: '0.5rem' }}>Admin Portal</div>
        </div>

        <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div className="section-label" style={{ paddingLeft: '0.5rem', marginBottom: '0.5rem' }}>User Management</div>
          <button 
            className={`btn ${activeTab === 'view-users' ? 'btn-primary' : 'btn-ghost'}`} 
            style={{ justifyContent: 'flex-start' }}
            onClick={() => setActiveTab('view-users')}
          >
            <Users size={18} /> View Users
          </button>
          <button 
            className={`btn ${activeTab === 'create-user' ? 'btn-primary' : 'btn-ghost'}`} 
            style={{ justifyContent: 'flex-start' }}
            onClick={() => setActiveTab('create-user')}
          >
            <Plus size={18} /> Create User
          </button>
          
          <div className="section-label" style={{ paddingLeft: '0.5rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>Account</div>
          <button 
            className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-ghost'}`} 
            style={{ justifyContent: 'flex-start' }}
            onClick={() => setActiveTab('profile')}
          >
            <User size={18} /> My Profile
          </button>
        </nav>

        <div style={{ padding: '1.5rem 1rem', borderTop: '1px solid var(--border-side)' }}>
          <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--red)' }} onClick={handleLogout}>
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, minWidth: 0, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'view-users' && <UserManagement mode="view" />}
        {activeTab === 'create-user' && <UserManagement mode="create" onUserCreated={() => setActiveTab('view-users')} />}
        {activeTab === 'profile' && <UserProfile userInfo={userInfo} />}
      </main>

    </div>
  );
};

export default AdminPortal;
