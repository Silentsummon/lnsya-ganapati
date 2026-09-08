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
  const { poojasDays, totalDays, poojaCheckins, checkInSlot } = useAppStore()
  const visibleDays = poojasDays.filter(d => d.day_number <= totalDays)

  return (
    <div className="container" style={{ paddingTop: '5rem', paddingBottom: '3rem' }}>
      <div className="back-btn" onClick={() => navigate('/')}>
        <span className="back-circle">&#8592;</span> Back
      </div>
      <h1 style={{ color: '#fff', fontSize: '1.6rem', marginBottom: '1.5rem' }}>Utsav Schedule</h1>

      {visibleDays.map(day => {
        const dateLabel = formatDate(day.pooja_date)
        const checkins = poojaCheckins[day.id] || []
        const entry1 = checkins.find(c => c.slot_number === 1)
        const entry2 = checkins.find(c => c.slot_number === 2)

        return (
          <div className="day-card" key={day.id} style={{ padding: '1.1rem 1.3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '0.9rem' }}>
              <div className="day-badge">D{day.day_number}</div>
              <div>
                <div className="day-title">Day {day.day_number}</div>
                <div className="day-sub">{dateLabel || 'Date not set yet'}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.7rem' }}>
              <CheckInBox dayId={day.id} slotNumber={1} entry={entry1} checkInSlot={checkInSlot} />
              <CheckInBox dayId={day.id} slotNumber={2} entry={entry2} checkInSlot={checkInSlot} />
            </div>

            {day.announcement_title && (
              <div className="announcement-box" style={{ marginTop: '0.9rem' }}>
                <div className="announcement-title">{day.announcement_title}</div>
                <div className="announcement-msg">{day.announcement_message}</div>
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

function CheckInBox({ dayId, slotNumber, entry, checkInSlot }) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [groupSize, setGroupSize] = useState('2')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleConfirm = async () => {
    setError('')
    if (!name.trim() || !phone.trim()) {
      setError('Please fill in your name and phone.')
      return
    }
    setSubmitting(true)
    const res = await checkInSlot(dayId, slotNumber, name.trim(), phone.trim(), parseInt(groupSize))
    setSubmitting(false)
    if (!res.success) {
      setError(res.error || 'Something went wrong.')
    }
  }

  if (entry) {
    return (
      <div style={{
        background: '#e9f9ee', border: '1px solid #86d9a3', borderRadius: '0.6rem',
        padding: '0.8rem 1rem',
      }}>
        <div style={{ color: '#15803d', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.2rem' }}>
          ✓ Checked In
        </div>
        <div style={{ color: '#166534', fontSize: '0.8rem' }}>
          {entry.name} • {entry.group_size} {entry.group_size === 1 ? 'person' : 'people'}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: '#fafafa', border: '1px solid #e5e5e5', borderRadius: '0.6rem',
      padding: '0.8rem 1rem',
    }}>
      {!showForm ? (
        <button className="link-btn" onClick={() => setShowForm(true)} style={{ width: '100%', textAlign: 'left' }}>
          + Participate in Pooja
        </button>
      ) : (
        <div>
          <input className="mini-input" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
          <input className="mini-input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" />
          <select className="mini-input" value={groupSize} onChange={e => setGroupSize(e.target.value)}>
            <option value="2">2 people</option>
            <option value="3">3 people</option>
            <option value="4">4 people</option>
            <option value="5">5 people</option>
          </select>
          <div className="btn-row">
            <button className="btn" style={{ flex: 1 }} disabled={submitting} onClick={handleConfirm}>
              {submitting ? 'Confirming...' : 'Confirm'}
            </button>
            <button className="btn" style={{ flex: 1 }} onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
          {error && <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.4rem', fontWeight: 600 }}>{error}</div>}
        </div>
      )}
    </div>
  )
}
