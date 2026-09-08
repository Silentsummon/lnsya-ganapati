import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore'

function formatLongDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T00:00:00')
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  return `${months[d.getMonth()]} ${d.getDate()} — ${days[d.getDay()]}`
}

export default function Events() {
  const navigate = useNavigate()
  const { poojasDays, totalDays } = useAppStore()
  const [expandedId, setExpandedId] = useState(null)
  const visibleDays = poojasDays.filter(d => d.day_number <= totalDays)

  return (
    <div className="container" style={{ paddingTop: '5rem', paddingBottom: '3rem' }}>
      <div className="back-btn" onClick={() => navigate('/')}>
        <span className="back-circle">&#8592;</span> Back
      </div>
      <h1 style={{ color: '#fff', fontSize: '1.6rem', marginBottom: '1.5rem' }}>Events</h1>

      {visibleDays.map(day => {
        const isOpen = expandedId === day.id
        const longDate = formatLongDate(day.pooja_date)
        const events = (day.events_text || '').split('\n').map(e => e.trim()).filter(Boolean)

        return (
          <div className="day-card" key={day.id}>
            <button className="day-header" onClick={() => setExpandedId(isOpen ? null : day.id)}>
              <div className="day-header-left">
                <div className="day-badge">D{day.day_number}</div>
                <div>
                  <div className="day-title">{longDate || `Day ${day.day_number}`}</div>
                </div>
              </div>
              <span className={`day-chevron ${isOpen ? 'open' : ''}`}>&#8250;</span>
            </button>
            {isOpen && (
              <div className="day-body">
                <div className="day-body-section">
                  {events.length > 0 ? (
                    events.map((ev, i) => (
                      <div key={i} className="day-body-text" style={{ marginBottom: '0.35rem' }}>
                        • {ev}
                      </div>
                    ))
                  ) : (
                    <div className="day-body-text" style={{ opacity: 0.6 }}>
                      No events scheduled for this day.
                    </div>
                  )}
                </div>
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
