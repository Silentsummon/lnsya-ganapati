import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore'
import { sendCustomMessage } from '../lib/whatsapp-api'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T00:00:00')
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

export default function Dashboard({ forcedRole }) {
  const navigate = useNavigate()
  const {
    totalDays, setTotalDays, poojasDays, updatePoojaDay, updateEvents, setAllDates,
    budget, setBudget, expenses, addExpense,
    chandha, addChandha, broadcastToChandha,
  } = useAppStore()

  const [userRole, setUserRole] = useState(forcedRole || '')
  const [tab, setTab] = useState('updates')

  useEffect(() => {
    if (forcedRole) { setUserRole(forcedRole); return }
    const role = localStorage.getItem('userRole')
    if (!role) { navigate('/roles'); return }
    setUserRole(role)
  }, [navigate, forcedRole])

  const handleLogout = () => {
    localStorage.removeItem('userRole')
    navigate('/')
  }

  const totalSpent = expenses.reduce((s, e) => s + Number(e.amount), 0)
  const balance = budget - totalSpent
  const visibleDays = poojasDays.filter(d => d.day_number <= totalDays)

  return (
    <div className="container" style={{ paddingTop: '5rem', paddingBottom: '3rem' }}>
      <div className="dash-header">
        <h1>{userRole && userRole[0].toUpperCase() + userRole.slice(1)} Dashboard</h1>
        {!forcedRole && <button className="btn btn-danger" onClick={handleLogout}>Logout</button>}
        {forcedRole && <button className="btn" onClick={() => navigate('/')}>Home</button>}
      </div>

      {userRole === 'president' && (
        <PresidentPanel
          totalDays={totalDays} setTotalDays={setTotalDays}
          days={visibleDays} updatePoojaDay={updatePoojaDay} updateEvents={updateEvents}
          setAllDates={setAllDates}
          chandha={chandha} broadcastToChandha={broadcastToChandha}
        />
      )}

      {userRole === 'treasurer' && (
        <TreasurerSection
          budget={budget} setBudget={setBudget}
          expenses={expenses} addExpense={addExpense}
          totalSpent={totalSpent} balance={balance}
          chandha={chandha}
        />
      )}

      {userRole === 'volunteer' && (
        <>
          <div className="tabs">
            <button className={`tab ${tab === 'updates' ? 'active' : ''}`} onClick={() => setTab('updates')}>Utsav Schedule</button>
            <button className={`tab ${tab === 'chandha' ? 'active' : ''}`} onClick={() => setTab('chandha')}>Chandha</button>
          </div>
          {tab === 'updates' && <VolunteerUpdates days={visibleDays} />}
          {tab === 'chandha' && <VolunteerChandha chandha={chandha} addChandha={addChandha} />}
        </>
      )}
    </div>
  )
}

function PresidentPanel({ totalDays, setTotalDays, days, updatePoojaDay, updateEvents, setAllDates, chandha, broadcastToChandha }) {
  const [editingTotal, setEditingTotal] = useState(false)
  const [totalInput, setTotalInput] = useState(String(totalDays))

  return (
    <div>
      <div className="event-days-banner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="banner-label">Overall Event Days</div>
            <div className="banner-value">{totalDays} Days</div>
          </div>
          <button className="btn" style={{ fontSize: '0.68rem', padding: '0.4rem 0.8rem' }}
            onClick={() => { setEditingTotal(!editingTotal); setTotalInput(String(totalDays)) }}>
            {editingTotal ? 'Cancel' : 'Edit'}
          </button>
        </div>
        {editingTotal && (
          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <input type="number" value={totalInput} onChange={e => setTotalInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (setTotalDays(parseInt(totalInput) || 0), setEditingTotal(false))}
              placeholder="Number of days" style={{ marginBottom: '0.5rem' }} />
            <button className="btn" style={{ width: '100%' }}
              onClick={() => { setTotalDays(parseInt(totalInput) || 0); setEditingTotal(false) }}>
              Set Days
            </button>
          </div>
        )}
      </div>

      <StartDateSetter setAllDates={setAllDates} />

      <WhatsAppTestPanel />

      {days.length === 0 && <p style={{ color: 'rgba(255,255,255,0.45)', textAlign: 'center', padding: '2rem 0', fontSize: '0.85rem' }}>Set overall days above to get started</p>}

      {days.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <PoojaSection days={days} updatePoojaDay={updatePoojaDay} />
          <EventsSection days={days} updateEvents={updateEvents} />
        </div>
      )}
    </div>
  )
}

function PoojaSection({ days, updatePoojaDay }) {
  const [sectionOpen, setSectionOpen] = useState(false)
  const [expandedId, setExpandedId] = useState(null)

  return (
    <div className="card">
      <button
        onClick={() => setSectionOpen(!sectionOpen)}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <div className="card-title" style={{ color: '#1a1a1a', marginBottom: 0 }}>Pooja</div>
        <span style={{ color: '#1a1a1a', fontSize: '1.2rem', transform: sectionOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>&#8250;</span>
      </button>
      {sectionOpen && (
        <div style={{ marginTop: '1rem' }}>
          {days.map(day => (
            <PoojaDayCard
              key={day.id}
              day={day}
              isOpen={expandedId === day.id}
              onToggle={() => setExpandedId(expandedId === day.id ? null : day.id)}
              updatePoojaDay={updatePoojaDay}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function PoojaDayCard({ day, isOpen, onToggle, updatePoojaDay }) {
  const [whatToBring, setWhatToBring] = useState(day.what_to_bring || '')
  const [poojaDate, setPoojaDate] = useState(day.pooja_date || '')
  const [annTitle, setAnnTitle] = useState(day.announcement_title || '')
  const [annMsg, setAnnMsg] = useState(day.announcement_message || '')

  const handleSave = () => {
    updatePoojaDay(day.id, whatToBring, annTitle, annMsg, poojaDate)
  }

  return (
    <div className="day-card">
      <button className="day-toggle-header" onClick={onToggle}>
        <div className="day-number-title" style={{ color: '#1a1a1a' }}>Day {day.day_number}{formatDate(day.pooja_date) ? ` — ${formatDate(day.pooja_date)}` : ''}</div>
        <span className="day-chevron-big" style={{ color: '#1a1a1a', transform: isOpen ? 'rotate(90deg)' : 'none' }}>&#8250;</span>
      </button>
      {isOpen && (
        <div style={{ padding: '0 1.1rem 1.1rem' }}>
          <div className="section-label" style={{ marginTop: '0.5rem', color: '#1a1a1a' }}>Date</div>
          <input type="date" className="mini-input" value={poojaDate} onChange={e => setPoojaDate(e.target.value)} />

          <div className="section-label" style={{ marginTop: '0.5rem', color: '#1a1a1a' }}>What to Bring</div>
          <textarea className="mini-input" rows={2} value={whatToBring} onChange={e => setWhatToBring(e.target.value)} placeholder="What to bring, instructions, etc." />

          <div className="section-label" style={{ marginTop: '0.5rem', color: '#1a1a1a' }}>Announcement Title</div>
          <input type="text" className="mini-input" value={annTitle} onChange={e => setAnnTitle(e.target.value)} placeholder="Announcement title" />

          <div className="section-label" style={{ marginTop: '0.5rem', color: '#1a1a1a' }}>Announcement Message</div>
          <textarea className="mini-input" rows={2} value={annMsg} onChange={e => setAnnMsg(e.target.value)} placeholder="Announcement message" />

          <button className="btn" style={{ width: '100%', marginTop: '0.4rem' }} onClick={handleSave}>Save</button>
        </div>
      )}
    </div>
  )
}

function EventsSection({ days, updateEvents }) {
  const [sectionOpen, setSectionOpen] = useState(false)
  const [expandedId, setExpandedId] = useState(null)

  return (
    <div className="card">
      <button
        onClick={() => setSectionOpen(!sectionOpen)}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <div className="card-title" style={{ color: '#1a1a1a', marginBottom: 0 }}>Events</div>
        <span style={{ color: '#1a1a1a', fontSize: '1.2rem', transform: sectionOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>&#8250;</span>
      </button>
      {sectionOpen && (
        <div style={{ marginTop: '1rem' }}>
          {days.map(day => (
            <EventsDayCard
              key={day.id}
              day={day}
              isOpen={expandedId === day.id}
              onToggle={() => setExpandedId(expandedId === day.id ? null : day.id)}
              updateEvents={updateEvents}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function EventsDayCard({ day, isOpen, onToggle, updateEvents }) {
  const [eventsText, setEventsText] = useState(day.events_text || '')

  const handleSave = () => {
    updateEvents(day.id, eventsText)
  }

  return (
    <div className="day-card">
      <button className="day-toggle-header" onClick={onToggle}>
        <div className="day-number-title" style={{ color: '#1a1a1a' }}>Day {day.day_number}{formatDate(day.pooja_date) ? ` — ${formatDate(day.pooja_date)}` : ''}</div>
        <span className="day-chevron-big" style={{ color: '#1a1a1a', transform: isOpen ? 'rotate(90deg)' : 'none' }}>&#8250;</span>
      </button>
      {isOpen && (
        <div style={{ padding: '0 1.1rem 1.1rem' }}>
          <div className="section-label" style={{ marginTop: '0.5rem', color: '#1a1a1a' }}>Events (one per line)</div>
          <textarea
            className="mini-input"
            rows={5}
            value={eventsText}
            onChange={e => setEventsText(e.target.value)}
            placeholder="Ganesh Pooja, Cultural Program, Bhajan, Dinner / Prasadam (one per line)"
          />
          <button className="btn" style={{ width: '100%', marginTop: '0.4rem' }} onClick={handleSave}>Save</button>
        </div>
      )}
    </div>
  )
}

function BroadcastPanel({ chandha, broadcastToChandha }) {
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)

  const uniqueCount = (() => {
    const seen = new Set()
    for (const c of chandha) {
      const phone = (c.phone || '').trim()
      if (phone) seen.add(phone)
    }
    return seen.size
  })()

  const handleSend = async () => {
    if (!message.trim()) return
    setSending(true)
    setResult(null)
    const res = await broadcastToChandha(message.trim())
    setSending(false)
    setResult(res)
    if (res.success) setMessage('')
  }

  return (
    <div className="section-box" style={{ marginBottom: '1.25rem' }}>
      <div className="section-label amber">Event Announcement ({uniqueCount} unique numbers)</div>
      {!showForm ? (
        <button className="link-btn amber" onClick={() => setShowForm(true)}>+ Add Event Announcement</button>
      ) : (
        <div>
          <textarea
            className="mini-input"
            rows={3}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="e.g. Homam tomorrow at 6 AM, please arrive by 5:45"
          />
          <div className="btn-row">
            <button className="btn" disabled={sending} onClick={handleSend} style={{ flex: 1 }}>
              {sending ? 'Sending...' : `Send to All (${uniqueCount})`}
            </button>
            <button className="btn" onClick={() => { setShowForm(false); setResult(null) }} style={{ flex: 1 }}>
              Cancel
            </button>
          </div>
          {result && result.success && (
            <div style={{ color: '#bbf7d0', fontSize: '0.78rem', marginTop: '0.6rem' }}>
              ✓ [Dummy] Would have sent to {result.count} number(s). Check browser console for details.
            </div>
          )}
          {result && !result.success && (
            <div style={{ color: '#fecaca', fontSize: '0.78rem', marginTop: '0.6rem' }}>
              {result.error}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function WhatsAppTestPanel() {
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)

  const handleSend = async () => {
    if (!phone.trim() || !message.trim()) return
    setSending(true)
    setResult(null)
    const res = await sendCustomMessage(phone.trim(), message.trim())
    setSending(false)
    setResult(res)
  }

  return (
    <div className="section-box" style={{ marginBottom: '1.25rem', border: '1px dashed #d4d4d4' }}>
      <div className="section-label">WhatsApp Test (single number only)</div>
      <input
        className="mini-input"
        type="tel"
        value={phone}
        onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
        placeholder="Your phone number, e.g. 9876543210"
      />
      <textarea
        className="mini-input"
        rows={2}
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Test message"
      />
      <button className="btn" style={{ width: '100%' }} disabled={sending} onClick={handleSend}>
        {sending ? 'Sending...' : 'Send Test Message'}
      </button>
      {result && (
        <div style={{
          marginTop: '0.6rem', fontSize: '0.78rem', fontWeight: 600,
          color: result.success === false ? '#dc2626' : '#15803d',
        }}>
          {result.success === false ? `Failed: ${result.error}` : 'Sent successfully!'}
        </div>
      )}
    </div>
  )
}

function StartDateSetter({ setAllDates }) {
  const [showForm, setShowForm] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [saving, setSaving] = useState(false)

  const handleApply = async () => {
    if (!startDate) return
    setSaving(true)
    await setAllDates(startDate)
    setSaving(false)
    setShowForm(false)
  }

  return (
    <div className="section-box" style={{ marginBottom: '1.25rem' }}>
      <div className="section-label">Set Day 1 Date (auto-fills all days sequentially)</div>
      {!showForm ? (
        <button className="link-btn" onClick={() => setShowForm(true)}>+ Set Start Date</button>
      ) : (
        <div>
          <input
            className="mini-input"
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
          <div className="btn-row">
            <button className="btn" disabled={saving} onClick={handleApply} style={{ flex: 1 }}>
              {saving ? 'Applying...' : 'Apply to All Days'}
            </button>
            <button className="btn" onClick={() => setShowForm(false)} style={{ flex: 1 }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function DayEditorCard({ day, isOpen, onToggle, updatePoojaDay, updateEvents }) {
  const [editingInfo, setEditingInfo] = useState(false)
  const [whatToBring, setWhatToBring] = useState(day.what_to_bring || '')

  const [editingDate, setEditingDate] = useState(false)
  const [poojaDate, setPoojaDate] = useState(day.pooja_date || '')

  const [editingAnnounce, setEditingAnnounce] = useState(false)
  const [annTitle, setAnnTitle] = useState(day.announcement_title || '')
  const [annMsg, setAnnMsg] = useState(day.announcement_message || '')

  const dateLabel = formatDate(day.pooja_date)

  const handleSaveDate = () => {
    updatePoojaDay(day.id, day.what_to_bring, day.announcement_title, day.announcement_message, poojaDate)
    setEditingDate(false)
  }

  const handleSaveInfo = () => {
    if (!whatToBring.trim()) return
    updatePoojaDay(day.id, whatToBring, day.announcement_title, day.announcement_message, day.pooja_date)
    setEditingInfo(false)
  }

  const [editingEvents, setEditingEvents] = useState(false)
  const [eventsText, setEventsText] = useState(day.events_text || '')

  const handleSaveEvents = () => {
    updateEvents(day.id, eventsText)
    setEditingEvents(false)
  }

  const handleSaveAnnouncement = () => {
    if (!annTitle.trim() || !annMsg.trim()) return
    updatePoojaDay(day.id, day.what_to_bring, annTitle, annMsg, day.pooja_date)
    setEditingAnnounce(false)
  }

  return (
    <div className="day-card">
      <button className="day-toggle-header" onClick={onToggle}>
        <div>
          <div className="day-number-title">Day {day.day_number}</div>
          {dateLabel && <div className="day-sub" style={{ marginTop: '2px' }}>{dateLabel}</div>}
        </div>
        <span className={`day-chevron-big ${isOpen ? 'open' : ''}`}>&#8250;</span>
      </button>

      {isOpen && (
        <div style={{ padding: '0 1.1rem 1.1rem' }}>
          {/* Date */}
          <div className="section-box">
            <div className="section-label">Pooja Date</div>
            {dateLabel ? <div className="info-text">{dateLabel}</div> : <div className="empty-text">Not set yet</div>}
            <button className="link-btn" onClick={() => { setEditingDate(!editingDate); setPoojaDate(day.pooja_date || '') }}>
              {editingDate ? 'Cancel' : 'Edit'}
            </button>
            {editingDate && (
              <div style={{ marginTop: '0.4rem' }}>
                <input className="mini-input" type="date" value={poojaDate} onChange={e => setPoojaDate(e.target.value)} />
                <button className="btn" style={{ width: '100%' }} onClick={handleSaveDate}>Save</button>
              </div>
            )}
          </div>

          {/* What to Bring */}
          <div className="section-box">
            <div className="section-label">What to Bring</div>
            {day.what_to_bring ? <div className="info-text">{day.what_to_bring}</div> : <div className="empty-text">Not added yet</div>}
            <button className="link-btn" onClick={() => { setEditingInfo(!editingInfo); setWhatToBring(day.what_to_bring || '') }}>
              {editingInfo ? 'Cancel' : 'Edit'}
            </button>
            {editingInfo && (
              <div style={{ marginTop: '0.4rem' }}>
                <textarea className="mini-input" rows={2} value={whatToBring} onChange={e => setWhatToBring(e.target.value)} placeholder="What to bring, instructions, etc." />
                <button className="btn" style={{ width: '100%' }} onClick={handleSaveInfo}>Save</button>
              </div>
            )}
          </div>

          {/* Events */}
          <div className="section-box">
            <div className="section-label">Events</div>
            {day.events_text ? (
              <div className="info-text" style={{ whiteSpace: 'pre-line' }}>{day.events_text}</div>
            ) : (
              <div className="empty-text">No events added yet</div>
            )}
            <button className="link-btn" onClick={() => { setEditingEvents(!editingEvents); setEventsText(day.events_text || '') }}>
              {editingEvents ? 'Cancel' : 'Edit'}
            </button>
            {editingEvents && (
              <div style={{ marginTop: '0.4rem' }}>
                <textarea
                  className="mini-input"
                  rows={4}
                  value={eventsText}
                  onChange={e => setEventsText(e.target.value)}
                  placeholder={"One event per line, e.g.\nGanesh Pooja\nCultural Program\nBhajan\nDinner / Prasadam"}
                />
                <button className="btn" style={{ width: '100%' }} onClick={handleSaveEvents}>Save</button>
              </div>
            )}
          </div>

          {/* Announcement */}
          {day.announcement_title ? (
            <div className="section-box">
              <div className="section-label amber">Announcement</div>
              <div className="info-text">
                <div style={{ fontWeight: 600 }}>{day.announcement_title}</div>
                <div style={{ opacity: 0.8, marginTop: '2px' }}>{day.announcement_message}</div>
              </div>
              <button className="link-btn amber" onClick={() => {
                setEditingAnnounce(!editingAnnounce)
                setAnnTitle(day.announcement_title || ''); setAnnMsg(day.announcement_message || '')
              }}>
                {editingAnnounce ? 'Cancel' : 'Edit'}
              </button>
              {editingAnnounce && (
                <div style={{ marginTop: '0.4rem' }}>
                  <input className="mini-input" type="text" value={annTitle} onChange={e => setAnnTitle(e.target.value)} placeholder="Announcement title" />
                  <textarea className="mini-input" rows={2} value={annMsg} onChange={e => setAnnMsg(e.target.value)} placeholder="Announcement message" />
                  <button className="btn" style={{ width: '100%' }} onClick={handleSaveAnnouncement}>Save</button>
                </div>
              )}
            </div>
          ) : (
            !editingAnnounce ? (
              <button className="announce-btn" onClick={() => setEditingAnnounce(true)}>+ Add Announcement</button>
            ) : (
              <div className="section-box">
                <input className="mini-input" type="text" value={annTitle} onChange={e => setAnnTitle(e.target.value)} placeholder="Announcement title" />
                <textarea className="mini-input" rows={2} value={annMsg} onChange={e => setAnnMsg(e.target.value)} placeholder="Announcement message" />
                <button className="btn" style={{ width: '100%' }} onClick={handleSaveAnnouncement}>Save</button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}

function TreasurerSection({ budget, setBudget, expenses, addExpense, totalSpent, balance, chandha }) {
  const [treasurerTab, setTreasurerTab] = useState('expenses')

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <button
          onClick={() => setTreasurerTab('expenses')}
          style={{
            flex: 1,
            padding: '0.85rem 0.5rem',
            borderRadius: '0.6rem',
            fontWeight: 700,
            fontSize: '0.85rem',
            border: treasurerTab === 'expenses' ? '1px solid #1a1a1a' : '1px solid #d4d4d4',
            background: treasurerTab === 'expenses' ? '#1a1a1a' : '#ffffff',
            color: treasurerTab === 'expenses' ? '#ffffff' : '#1a1a1a',
          }}
        >
          Expenses
        </button>
        <button
          onClick={() => setTreasurerTab('chandhas')}
          style={{
            flex: 1,
            padding: '0.85rem 0.5rem',
            borderRadius: '0.6rem',
            fontWeight: 700,
            fontSize: '0.85rem',
            border: treasurerTab === 'chandhas' ? '1px solid #1a1a1a' : '1px solid #d4d4d4',
            background: treasurerTab === 'chandhas' ? '#1a1a1a' : '#ffffff',
            color: treasurerTab === 'chandhas' ? '#ffffff' : '#1a1a1a',
          }}
        >
          Chandhas
        </button>
      </div>

      {treasurerTab === 'expenses' && (
        <>
          <div className="stat-grid">
            <div className="stat-box"><div className="stat-label">BUDGET</div><div className="stat-value">₹{budget}</div></div>
            <div className="stat-box deficit"><div className="stat-label">SPENT</div><div className="stat-value">₹{totalSpent}</div></div>
            <div className={`stat-box ${balance >= 0 ? 'surplus' : 'deficit'}`}>
              <div className="stat-label">{balance >= 0 ? 'SURPLUS' : 'DEFICIT'}</div>
              <div className="stat-value">₹{Math.abs(balance)}</div>
            </div>
          </div>
          <TreasurerPanel budget={budget} setBudget={setBudget} expenses={expenses} addExpense={addExpense} />
        </>
      )}

      {treasurerTab === 'chandhas' && (
        <div className="card">
          <div className="card-title" style={{ color: '#1a1a1a' }}>Chandha Contributors ({chandha.length})</div>
          {chandha.length === 0 && (
            <p style={{ color: '#9a9a9a', fontSize: '0.85rem' }}>No contributions yet.</p>
          )}
          {chandha.map(c => (
            <div
              key={c.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.85rem 0.9rem',
                background: '#fafafa',
                border: '1px solid #eeeeee',
                borderRadius: '0.6rem',
                marginBottom: '0.6rem',
                gap: '0.5rem',
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                  color: '#1a1a1a', fontWeight: 700, fontSize: '0.85rem',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {c.name}
                </div>
              </div>
              <div style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                ₹{c.amount}
              </div>
              <div style={{
                padding: '0.3rem 0.7rem',
                borderRadius: '999px',
                fontSize: '0.72rem',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                background: c.status === 'Paid' ? '#dcfce7' : '#fee2e2',
                color: c.status === 'Paid' ? '#15803d' : '#b91c1c',
              }}>
                {c.status === 'Paid' ? '🟩 Paid' : '🟥 Pending'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TreasurerPanel({ budget, setBudget, expenses, addExpense }) {
  const [budgetInput, setBudgetInput] = useState(String(budget))
  const [expenseName, setExpenseName] = useState('')
  const [expenseAmount, setExpenseAmount] = useState('')

  useEffect(() => { setBudgetInput(String(budget)) }, [budget])

  return (
    <>
      <div className="card">
        <div className="card-title">Set Budget</div>
        <div className="btn-row">
          <input type="number" value={budgetInput} onChange={e => setBudgetInput(e.target.value)} placeholder="Budget amount" style={{ maxWidth: 200 }} />
          <button className="btn" onClick={() => setBudget(parseFloat(budgetInput) || 0)}>Update</button>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Add Expense</div>
        <div className="form-grid">
          <input type="text" value={expenseName} onChange={e => setExpenseName(e.target.value)} placeholder="Expense name" />
          <input type="number" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} placeholder="Amount" />
        </div>
        <button className="btn" onClick={() => {
          if (expenseName && expenseAmount) {
            addExpense(expenseName, parseFloat(expenseAmount), new Date().toISOString().split('T')[0])
            setExpenseName(''); setExpenseAmount('')
          }
        }}>Add Expense</button>
      </div>

      <div className="card">
        <div className="card-title">Expenses</div>
        {expenses.length === 0 && <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem' }}>No expenses yet.</p>}
        {expenses.map(exp => (
          <div className="list-row" key={exp.id}>
            <div><div className="list-row-name">{exp.expense_name}</div><div className="list-row-sub">{exp.expense_date}</div></div>
            <div className="list-row-amount">₹{exp.amount}</div>
          </div>
        ))}
      </div>
    </>
  )
}

function VolunteerUpdates({ days }) {
  return (
    <div>
      {days.map(day => {
        const dateLabel = formatDate(day.pooja_date)
        return (
          <div className="card" key={day.id}>
            <div className="card-title">Day {day.day_number}{dateLabel ? ` · ${dateLabel}` : ''}</div>
            <div className="day-body-label">What to Bring</div>
            <div className="day-body-text">{day.what_to_bring}</div>
            {day.announcement_title && (
              <div className="announcement-box">
                <div className="announcement-title">{day.announcement_title}</div>
                <div className="announcement-msg">{day.announcement_message}</div>
              </div>
            )}
          </div>
        )
      })}
      {days.length === 0 && <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem' }}>No days scheduled yet.</p>}
    </div>
  )
}

function VolunteerChandha({ chandha, addChandha }) {
  const [view, setView] = useState('list')

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
  }

  const exportCSV = () => {
    const headers = ['Name', 'Phone', 'Street', 'Amount', 'Status', 'Date Added']
    const rows = chandha.map(c => [
      c.name, c.phone, c.street, c.amount, c.status, formatDate(c.created_at)
    ])
    const csvContent = [headers, ...rows]
      .map(row => row.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(','))
      .join(String.fromCharCode(10))
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `chandha-collection-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text('Chandha Collection', 14, 16)
    doc.setFontSize(10)
    doc.text(`Generated: ${formatDate(new Date().toISOString())}`, 14, 22)

    autoTable(doc, {
      startY: 28,
      head: [['Name', 'Phone', 'Street', 'Amount', 'Status', 'Date Added']],
      body: chandha.map(c => [
        c.name, c.phone, c.street, `Rs. ${c.amount}`, c.status, formatDate(c.created_at)
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [180, 83, 9] },
    })

    const total = chandha.reduce((s, c) => s + Number(c.amount), 0)
    const finalY = doc.lastAutoTable.finalY || 30
    doc.setFontSize(11)
    doc.text(`Total Collected: Rs. ${total}`, 14, finalY + 10)

    doc.save(`chandha-collection-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  if (view === 'add') {
    return <ChandhaAddForm addChandha={addChandha} chandhaCount={chandha.length} onDone={() => setView('list')} />
  }

  const paidTotal = chandha.filter(c => c.status === 'Paid').reduce((s, c) => s + Number(c.amount), 0)
  const paidCount = chandha.filter(c => c.status === 'Paid').length
  const pendingTotal = chandha.filter(c => c.status === 'Pending').reduce((s, c) => s + Number(c.amount), 0)
  const pendingCount = chandha.filter(c => c.status === 'Pending').length
  const grandTotal = paidTotal + pendingTotal

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.6rem' }}>
        <div className="card-title" style={{ color: '#1a1a1a', marginBottom: 0, fontSize: '1.3rem' }}>Chandha list</div>
        <button className="btn" onClick={() => setView('add')}>Add another</button>
      </div>

      <div className="btn-row" style={{ marginBottom: '1.25rem' }}>
        <button className="btn" style={{ flex: 1, background: '#ffffff', color: '#1a1a1a', border: '1px solid #d4d4d4' }} onClick={exportCSV}>
          Export as CSV
        </button>
        <button className="btn" style={{ flex: 1, background: '#ffffff', color: '#1a1a1a', border: '1px solid #d4d4d4' }} onClick={exportPDF}>
          Export as PDF
        </button>
      </div>

      <div className="card" style={{ padding: '0.5rem 0' }}>
        {chandha.length === 0 && (
          <p style={{ color: '#9a9a9a', fontSize: '0.85rem', padding: '0 1.25rem' }}>No entries yet.</p>
        )}
        {chandha.map((c, i) => (
          <div
            key={c.id}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.9rem 1.25rem',
              borderBottom: i < chandha.length - 1 ? '1px solid #f0f0f0' : 'none',
            }}
          >
            <span style={{ color: '#1a1a1a', fontSize: '0.9rem', fontWeight: 500 }}>{c.name}</span>
            <span style={{ color: '#1a1a1a', fontSize: '0.9rem', fontWeight: 700 }}>₹{Number(c.amount).toLocaleString('en-IN')}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1rem 1.25rem', borderRadius: '0.7rem',
          background: '#dcfce7', border: '1px solid #86d9a3',
        }}>
          <div>
            <div style={{ color: '#15803d', fontWeight: 700, fontSize: '0.9rem' }}>Paid</div>
            <div style={{ color: '#166534', fontSize: '0.75rem' }}>{paidCount} {paidCount === 1 ? 'member' : 'members'}</div>
          </div>
          <div style={{ color: '#15803d', fontWeight: 800, fontSize: '1.15rem' }}>₹{paidTotal.toLocaleString('en-IN')}</div>
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1rem 1.25rem', borderRadius: '0.7rem',
          background: '#fef3c7', border: '1px solid #f0d98c',
        }}>
          <div>
            <div style={{ color: '#92400e', fontWeight: 700, fontSize: '0.9rem' }}>Pending</div>
            <div style={{ color: '#92400e', fontSize: '0.75rem' }}>{pendingCount} {pendingCount === 1 ? 'member' : 'members'}</div>
          </div>
          <div style={{ color: '#92400e', fontWeight: 800, fontSize: '1.15rem' }}>₹{pendingTotal.toLocaleString('en-IN')}</div>
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1rem 1.25rem', borderRadius: '0.7rem',
          background: '#ffffff', border: '1px solid #1a1a1a',
        }}>
          <div>
            <div style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '0.9rem' }}>Total</div>
            <div style={{ color: '#6b6b6b', fontSize: '0.75rem' }}>{chandha.length} {chandha.length === 1 ? 'member' : 'members'}</div>
          </div>
          <div style={{ color: '#1a1a1a', fontWeight: 800, fontSize: '1.15rem' }}>₹{grandTotal.toLocaleString('en-IN')}</div>
        </div>
      </div>
    </div>
  )
}

function ChandhaAddForm({ addChandha, chandhaCount, onDone }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [street, setStreet] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('Paid')
  const [submitting, setSubmitting] = useState(false)

  const handleAdd = async () => {
    if (submitting) return
    if (!name.trim() || !amount) return
    setSubmitting(true)
    await addChandha(name.trim(), phone.trim(), street.trim(), parseFloat(amount), status)
    setName(''); setPhone(''); setStreet(''); setAmount(''); setDescription(''); setStatus('Paid')
    setSubmitting(false)
    onDone()
  }

  return (
    <div>
      <div className="card-title" style={{ color: '#1a1a1a', fontSize: '1.3rem', marginBottom: '0.3rem' }}>Add a chandha</div>
      <p style={{ color: '#6b6b6b', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
        Record one member's contribution and payment status.
      </p>

      <div className="card">
        <div className="section-label" style={{ color: '#1a1a1a' }}>Name</div>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter name" style={{ marginBottom: '1rem' }} />

        <div className="section-label" style={{ color: '#1a1a1a' }}>Mobile number</div>
        <input type="tel" inputMode="numeric" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="Enter 10-digit number" style={{ marginBottom: '1rem' }} />

        <div className="section-label" style={{ color: '#1a1a1a' }}>Street</div>
        <input type="text" value={street} onChange={e => setStreet(e.target.value)} placeholder="Enter street" style={{ marginBottom: '1rem' }} />

        <div className="section-label" style={{ color: '#1a1a1a' }}>Chandha amount</div>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter amount" style={{ marginBottom: '1rem' }} />

        <div className="section-label" style={{ color: '#1a1a1a' }}>Description (optional)</div>
        <textarea rows={2} value={description} onChange={e => setDescription(e.target.value)} placeholder="Enter description if needed" style={{ marginBottom: '1rem' }} />

        <div className="section-label" style={{ color: '#1a1a1a' }}>Payment status</div>
        <div className="btn-row" style={{ marginBottom: '1.25rem' }}>
          <button
            onClick={() => setStatus('Paid')}
            style={{
              flex: 1, padding: '0.75rem', borderRadius: '0.6rem', fontWeight: 700, fontSize: '0.85rem',
              border: status === 'Paid' ? '2px solid #15803d' : '1px solid #d4d4d4',
              background: status === 'Paid' ? '#dcfce7' : '#ffffff',
              color: status === 'Paid' ? '#15803d' : '#6b6b6b',
            }}
          >
            Paid
          </button>
          <button
            onClick={() => setStatus('Pending')}
            style={{
              flex: 1, padding: '0.75rem', borderRadius: '0.6rem', fontWeight: 700, fontSize: '0.85rem',
              border: status === 'Pending' ? '2px solid #92400e' : '1px solid #d4d4d4',
              background: status === 'Pending' ? '#fef3c7' : '#ffffff',
              color: status === 'Pending' ? '#92400e' : '#6b6b6b',
            }}
          >
            Pending
          </button>
        </div>

        <button className="btn" style={{ width: '100%', opacity: submitting ? 0.6 : 1 }} disabled={submitting} onClick={handleAdd}>{submitting ? 'Adding...' : 'Add'}</button>
      </div>

      <button className="link-btn" style={{ color: '#1a1a1a', marginTop: '1rem', textAlign: 'center' }} onClick={onDone}>
        View chandha list ({chandhaCount})
      </button>
    </div>
  )
}
