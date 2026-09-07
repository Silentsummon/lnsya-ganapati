import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore'

function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T00:00:00')
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

export default function Updates() {
  const navigate = useNavigate()
  const { poojasDays, totalDays } = useAppStore()
  const [expanded, setExpanded] = useState(null)
  const visibleDays = poojasDays.filter(d => d.day_number <= totalDays)

  return (
    <div className="container" style={{ paddingTop: '5rem', paddingBottom: '3rem' }}>
      <div className="back-btn" onClick={() => navigate('/')}>
        <span className="back-circle">&#8592;</span> Back
      </div>
      <h1 style={{ color: '#fff', fontSize: '1.6rem', marginBottom: '1.5rem' }}>Utsav Schedule</h1>

      {visibleDays.map(day => {
        const isOpen = expanded === day.id
        const dateLabel = formatDate(day.pooja_date)
        return (
          <div className="day-card" key={day.id}>
            <button className="day-header" onClick={() => setExpanded(isOpen ? null : day.id)}>
              <div className="day-header-left">
                <div className="day-badge">D{day.day_number}</div>
                <div>
                  <div className="day-title">Day {day.day_number}</div>
                  <div className="day-sub">{dateLabel || 'Date not set yet'}</div>
                </div>
              </div>
              <span className={`day-chevron ${isOpen ? 'open' : ''}`}>&#8250;</span>
            </button>
            {isOpen && (
              <div className="day-body">
                <div className="day-body-section">
                  <div className="day-body-label">What to Bring</div>
                  <div className="day-body-text">{day.what_to_bring}</div>
                </div>
                {day.announcement_title && (
                  <div className="announcement-box">
                    <div className="announcement-title">{day.announcement_title}</div>
                    <div className="announcement-msg">{day.announcement_message}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {visibleDays.length === 0 && (
        <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '3rem 0', fontSize: '0.85rem' }}>
          No days scheduled yet
        </p>
      )}
    </div>
  )
}
