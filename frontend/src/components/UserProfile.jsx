import { useState, useEffect } from 'react';
import { User, Loader2 } from 'lucide-react';
import api from '../api/axiosConfig';

const UserProfile = ({ userInfo: propUserInfo }) => {
  const [userInfo, setUserInfo] = useState(propUserInfo || null);
  const [loading, setLoading] = useState(!propUserInfo);

  useEffect(() => {
    if (propUserInfo) {
      setUserInfo(propUserInfo);
      setLoading(false);
      return;
    }
    // Fallback: fetch profile ourselves if prop not passed
    const fetch = async () => {
      try {
        const res = await api.get('/user');
        setUserInfo(res.data);
      } catch (e) {
        console.error('Failed to fetch profile', e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [propUserInfo]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--t2)', padding: '2rem' }}>
        <Loader2 size={20} style={{ animation: 'spin 0.8s linear infinite' }} />
        Loading profile...
      </div>
    );
  }

  if (!userInfo) return <div style={{ padding: '2rem', color: 'var(--t2)' }}>Could not load profile.</div>;

  return (
    <div className="fade-up">
      <div className="flex items-center mb-6" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
          <User size={24} color="var(--blue-l)" />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>My Profile</h2>
      </div>

      <div className="glass-card" style={{ padding: '2rem', maxWidth: '500px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <div>
            <label className="section-label">Username</label>
            <div style={{ fontSize: '1.1rem', fontWeight: '500', color: 'var(--t1)', marginTop: '0.25rem' }}>
              {userInfo.username}
            </div>
          </div>

          <div className="divider"></div>

          <div>
            <label className="section-label">System Role</label>
            <div style={{ marginTop: '0.5rem' }}>
              <span className={`badge ${userInfo.role === 'ADMIN' ? 'badge-admin' : 'badge-agent'}`} style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
                {userInfo.role}
              </span>
            </div>
          </div>

          <div className="divider"></div>

          <div>
            <label className="section-label">Status</label>
            <div style={{ marginTop: '0.5rem' }}>
              <span className={`badge ${userInfo.enabled ? 'badge-on' : 'badge-off'}`} style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
                {userInfo.enabled ? 'Account Active' : 'Account Disabled'}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserProfile;