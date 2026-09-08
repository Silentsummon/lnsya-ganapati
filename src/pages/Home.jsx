import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore'

const PREVIEW_COUNT = 5

export default function Home() {
  const navigate = useNavigate()
  const { chandha } = useAppStore()
  const [showAll, setShowAll] = useState(false)
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const total = chandha.reduce((sum, c) => sum + Number(c.amount), 0)
  const displayed = showAll ? chandha : chandha.slice(0, PREVIEW_COUNT)

  return (
    <div>
      <div className="landing">
        <h1>LNSYA</h1>
        <h2>Ganpati Celebration</h2>
        <button className="updates-btn" onClick={() => navigate('/updates')}>VIEW UTSAV SCHEDULE</button>
        <button className="updates-btn" style={{ marginTop: '0.75rem' }} onClick={() => navigate('/events')}>EVENTS</button>
      </div>

      <div
        ref={sectionRef}
        className={`fade-in-section ${visible ? 'visible' : ''}`}
        style={{ padding: '1.5rem 1.25rem 3rem', maxWidth: '600px', margin: '0 auto' }}
      >
        <div className="card">
          <div className="card-title" style={{ color: '#1a1a1a' }}>Chandha Contributions</div>

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0.85rem 1rem', background: '#fafafa', border: '1px solid #eeeeee',
            borderRadius: '0.6rem', marginBottom: '1rem',
          }}>
            <span style={{ color: '#6b6b6b', fontSize: '0.8rem', fontWeight: 600 }}>Total Contributions</span>
            <span style={{ color: '#1a1a1a', fontSize: '1.1rem', fontWeight: 800 }}>₹{total.toLocaleString('en-IN')}</span>
          </div>

          {displayed.length === 0 && (
            <p style={{ color: '#9a9a9a', fontSize: '0.85rem' }}>No contributions yet.</p>
          )}

          {displayed.map(c => (
            <div
              key={c.id}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.7rem 0.2rem', borderBottom: '1px solid #f0f0f0',
              }}
            >
              <span style={{
                color: '#1a1a1a', fontSize: '0.85rem', fontWeight: 600,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '0.75rem',
              }}>
                {c.name}
              </span>
              <span style={{ color: '#1a1a1a', fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                ₹{Number(c.amount).toLocaleString('en-IN')}
              </span>
            </div>
          ))}

          {chandha.length > PREVIEW_COUNT && (
            <button
              className="link-btn"
              style={{ color: '#1a1a1a', marginTop: '0.75rem' }}
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show Less' : `View All Contributions (${chandha.length})`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
