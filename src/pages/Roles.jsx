import { useNavigate } from 'react-router-dom'

export default function Roles() {
  const navigate = useNavigate()
  return (
    <div className="container" style={{ paddingTop: '5rem', paddingBottom: '3rem' }}>
      <h1 style={{ color: '#fca366', fontSize: '1.8rem', marginBottom: '1.5rem' }}>Team Access</h1>

      <button className="role-card" onClick={() => navigate('/president-pin')}>
        <div className="role-card-title">President</div>
        <div className="role-card-sub">Manage event days &amp; announcements — PIN required</div>
      </button>

      <button className="role-card" onClick={() => navigate('/treasurer-pin')}>
        <div className="role-card-title">Treasurer</div>
        <div className="role-card-sub">Budget &amp; expenses — PIN required</div>
      </button>

      <button className="role-card" onClick={() => navigate('/volunteer')}>
        <div className="role-card-title">Volunteer</div>
        <div className="role-card-sub">Updates &amp; chandha collection — no PIN needed</div>
      </button>
    </div>
  )
}
