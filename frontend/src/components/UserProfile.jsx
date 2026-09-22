import { User, Shield, Activity, Calendar } from 'lucide-react';

const UserProfile = ({ userInfo }) => {
  if (!userInfo) return null;

  const isAdmin = userInfo.role === 'ADMIN';

  return (
    <div className="fade-up">
      <div className="mb-6">
        <h2 className="page-title">My Profile</h2>
        <p className="section-label mt-4">Personal Information</p>
      </div>

      <div className="win p-8" style={{ padding: '2.5rem', maxWidth: '600px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
          <div className="flex-center" style={{ 
            width: '80px', height: '80px', borderRadius: '50%', 
            background: isAdmin ? 'rgba(29, 78, 216, 0.1)' : 'rgba(4, 120, 87, 0.1)',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)'
          }}>
            {isAdmin ? <Shield size={40} color="var(--blue)" /> : <User size={40} color="var(--emerald)" />}
          </div>
          
          <div>
            <h3 className="page-title" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{userInfo.username}</h3>
            <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-manager'}`} style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
              {userInfo.role}
            </span>
          </div>
        </div>

        <div className="divider" style={{ margin: '2rem 0' }}></div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--t3)', marginBottom: '8px' }}>
              <Activity size={16} /> <span className="section-label">Account Status</span>
            </div>
            <span className={`badge ${userInfo.enabled ? 'badge-on' : 'badge-off'}`}>
              {userInfo.enabled ? 'ACTIVE' : 'DISABLED'}
            </span>
          </div>
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--t3)', marginBottom: '8px' }}>
              <Calendar size={16} /> <span className="section-label">Member Since</span>
            </div>
            <p style={{ fontWeight: 500, color: 'var(--t1)' }}>Just now</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;