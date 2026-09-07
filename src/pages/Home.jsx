import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  return (
    <div className="landing">
      <h1>LNSYA</h1>
      <h2>Ganpati Celebration</h2>
      <button className="updates-btn" onClick={() => navigate('/updates')}>VIEW UPDATES</button>
    </div>
  )
}
