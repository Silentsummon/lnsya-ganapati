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
  const { poojasDays, totalDays, poojaPeople, addPerson } = useAppStore()
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
        const people = poojaPeople[day.id] || []

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

                <div className="day-body-section">
                  <div className="day-body-label">Pooja People ({people.length}/2)</div>
                  {people.length === 0 && (
                    <div className="day-body-text" style={{ opacity: 0.6, marginBottom: '0.5rem' }}>Not assigned yet</div>
                  )}
                  {people.map(p => (
                    <div key={p.id} className="day-body-text" style={{ marginBottom: '0.3rem' }}>
                      {p.name} — {p.phone} • {p.lane}
                    </div>
                  ))}

                  {people.length < 2 && (
                    <SignupForm dayId={day.id} addPerson={addPerson} />
                  )}
                  {people.length >= 2 && (
                    <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.75rem', marginTop: '0.4rem' }}>
                      Both slots for this day are filled.
                    </div>
                  )}
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

function SignupForm({ dayId, addPerson }) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [lane, setLane] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim() || !lane.trim()) return
    setSubmitting(true)
    await addPerson(dayId, name.trim(), phone.trim(), lane.trim())
    setSubmitting(false)
    setDone(true)
  }

  if (done) {
    return (
      <div style={{ color: '#bbf7d0', fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 600 }}>
        ✓ You're checked in for this day!
      </div>
    )
  }

  if (!showForm) {
    return (
      <button className="link-btn" onClick={() => setShowForm(true)}>
        + Check In for This Day
      </button>
    )
  }

  return (
    <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
      <input className="mini-input" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
      <input className="mini-input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" />
      <input className="mini-input" type="text" value={lane} onChange={e => setLane(e.target.value)} placeholder="Lane/Area" />
      <button className="btn" style={{ width: '100%' }} disabled={submitting} onClick={handleSubmit}>
        {submitting ? 'Submitting...' : 'Confirm Check-In'}
      </button>
    </div>
  )
}
