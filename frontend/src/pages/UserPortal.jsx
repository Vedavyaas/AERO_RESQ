import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Navigation, Plus } from 'lucide-react';
import { Drone } from 'lucide-react';
import api from '../api/axiosConfig';
import DroneManagement from '../components/DroneManagement';
import MissionManagement from '../components/MissionManagement';
import UserProfile from '../components/UserProfile';

const UserPortal = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('view-drones');

  useEffect(() => {
    // 1. Check token presence
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'USER') {
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
          <div className="badge badge-agent" style={{ marginTop: '0.5rem' }}>User Portal</div>
        </div>

        <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          
          <div className="section-label" style={{ paddingLeft: '0.5rem', marginBottom: '0.5rem' }}>Drones</div>
          <button 
            className={`btn ${activeTab === 'view-drones' ? 'btn-primary' : 'btn-ghost'}`} 
            style={{ justifyContent: 'flex-start' }}
            onClick={() => setActiveTab('view-drones')}
          >
            <Drone size={18} /> View Drones
          </button>
          <button 
            className={`btn ${activeTab === 'create-drone' ? 'btn-primary' : 'btn-ghost'}`} 
            style={{ justifyContent: 'flex-start' }}
            onClick={() => setActiveTab('create-drone')}
          >
            <Plus size={18} /> Register Drone
          </button>

          <div className="section-label" style={{ paddingLeft: '0.5rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>Missions</div>
          <button 
            className={`btn ${activeTab === 'view-missions' ? 'btn-primary' : 'btn-ghost'}`} 
            style={{ justifyContent: 'flex-start' }}
            onClick={() => setActiveTab('view-missions')}
          >
            <Navigation size={18} /> View Missions
          </button>
          <button 
            className={`btn ${activeTab === 'create-mission' ? 'btn-primary' : 'btn-ghost'}`} 
            style={{ justifyContent: 'flex-start' }}
            onClick={() => setActiveTab('create-mission')}
          >
            <Plus size={18} /> Create Mission
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
      <main style={{ flex: 1, minWidth: 0, padding: '1rem 2rem 1rem 1rem', overflowY: 'auto' }}>
        {activeTab === 'view-drones' && <DroneManagement mode="view" />}
        {activeTab === 'create-drone' && <DroneManagement mode="create" onDroneCreated={() => setActiveTab('view-drones')} />}
        {activeTab === 'view-missions' && <MissionManagement mode="view" />}
        {activeTab === 'create-mission' && <MissionManagement mode="create" onMissionCreated={() => setActiveTab('view-missions')} />}
        {activeTab === 'profile' && <UserProfile userInfo={userInfo} />}
      </main>

    </div>
  );
};

export default UserPortal;
