import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore'

function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function Dashboard({ forcedRole }) {
  const navigate = useNavigate()
  const {
    totalDays, setTotalDays, poojasDays, updatePoojaDay,
    poojaPeople, addPerson, deletePerson,
    budget, setBudget, expenses, addExpense,
    chandha, addChandha,
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
          days={visibleDays} updatePoojaDay={updatePoojaDay}
          poojaPeople={poojaPeople} addPerson={addPerson} deletePerson={deletePerson}
        />
      )}

      {userRole === 'treasurer' && (
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

      {userRole === 'volunteer' && (
        <>
          <div className="tabs">
            <button className={`tab ${tab === 'updates' ? 'active' : ''}`} onClick={() => setTab('updates')}>Updates</button>
            <button className={`tab ${tab === 'chandha' ? 'active' : ''}`} onClick={() => setTab('chandha')}>Chandha</button>
          </div>
          {tab === 'updates' && <VolunteerUpdates days={visibleDays} />}
          {tab === 'chandha' && <VolunteerChandha chandha={chandha} addChandha={addChandha} />}
        </>
      )}
    </div>
  )
}

function PresidentPanel({ totalDays, setTotalDays, days, updatePoojaDay, poojaPeople, addPerson, deletePerson }) {
  const [editingTotal, setEditingTotal] = useState(false)
  const [totalInput, setTotalInput] = useState(String(totalDays))
  const [expandedDay, setExpandedDay] = useState(null)

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

      {days.length === 0 && <p style={{ color: 'rgba(255,255,255,0.45)', textAlign: 'center', padding: '2rem 0', fontSize: '0.85rem' }}>Set overall days above to get started</p>}

      {days.map(day => (
        <DayEditorCard
          key={day.id}
          day={day}
          isOpen={expandedDay === day.id}
          onToggle={() => setExpandedDay(expandedDay === day.id ? null : day.id)}
          people={poojaPeople[day.id] || []}
          addPerson={addPerson}
          deletePerson={deletePerson}
          updatePoojaDay={updatePoojaDay}
        />
      ))}
    </div>
  )
}

function DayEditorCard({ day, isOpen, onToggle, people, addPerson, deletePerson, updatePoojaDay }) {
  const [addingPerson, setAddingPerson] = useState(false)
  const [pName, setPName] = useState('')
  const [pPhone, setPPhone] = useState('')
  const [pLane, setPLane] = useState('')

  const [editingInfo, setEditingInfo] = useState(false)
  const [whatToBring, setWhatToBring] = useState(day.what_to_bring || '')

  const [editingDate, setEditingDate] = useState(false)
  const [poojaDate, setPoojaDate] = useState(day.pooja_date || '')

  const [editingAnnounce, setEditingAnnounce] = useState(false)
  const [annTitle, setAnnTitle] = useState(day.announcement_title || '')
  const [annMsg, setAnnMsg] = useState(day.announcement_message || '')

  const dateLabel = formatDate(day.pooja_date)

  const handleAddPerson = () => {
    if (!pName.trim() || !pPhone.trim() || !pLane.trim()) return
    if (people.length >= 2) return
    addPerson(day.id, pName, pPhone, pLane)
    setPName(''); setPPhone(''); setPLane(''); setAddingPerson(false)
  }

  const handleSaveDate = () => {
    updatePoojaDay(day.id, day.what_to_bring, day.announcement_title, day.announcement_message, poojaDate)
    setEditingDate(false)
  }

  const handleSaveInfo = () => {
    if (!whatToBring.trim()) return
    updatePoojaDay(day.id, whatToBring, day.announcement_title, day.announcement_message, day.pooja_date)
    setEditingInfo(false)
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

          {/* Pooja People */}
          <div className="section-box">
            <div className="section-label orange">Pooja People (max 2)</div>
            {people.length === 0 && <div className="empty-text">No people added yet</div>}
            {people.map(p => (
              <div className="person-row" key={p.id}>
                <div>
                  <div className="person-name">{p.name}</div>
                  <div className="person-sub">{p.phone} • {p.lane}</div>
                </div>
                <button className="person-delete" onClick={() => deletePerson(day.id, p.id)}>✕</button>
              </div>
            ))}
            {people.length < 2 && !addingPerson && (
              <button className="link-btn" onClick={() => setAddingPerson(true)}>+ Add Person</button>
            )}
            {addingPerson && (
              <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                <input className="mini-input" type="text" value={pName} onChange={e => setPName(e.target.value)} placeholder="Person name" onKeyDown={e => e.key === 'Enter' && handleAddPerson()} />
                <input className="mini-input" type="text" value={pPhone} onChange={e => setPPhone(e.target.value)} placeholder="Phone" onKeyDown={e => e.key === 'Enter' && handleAddPerson()} />
                <input className="mini-input" type="text" value={pLane} onChange={e => setPLane(e.target.value)} placeholder="Lane/Area" onKeyDown={e => e.key === 'Enter' && handleAddPerson()} />
                <button className="btn" style={{ width: '100%' }} onClick={handleAddPerson}>Save</button>
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
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [street, setStreet] = useState('')
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState('Paid')

  return (
    <div>
      <div className="stat-grid">
        <div className="stat-box"><div className="stat-label">ENTRIES</div><div className="stat-value">{chandha.length}</div></div>
        <div className="stat-box surplus"><div className="stat-label">COLLECTED</div><div className="stat-value">₹{chandha.reduce((s,c)=>s+Number(c.amount),0)}</div></div>
        <div className="stat-box deficit"><div className="stat-label">PENDING</div><div className="stat-value">{chandha.filter(c=>c.status==='Pending').length}</div></div>
      </div>

      <div className="card">
        <div className="card-title">Add Chandha Entry</div>
        <div className="form-grid">
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
          <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone" />
          <input type="text" value={street} onChange={e => setStreet(e.target.value)} placeholder="Street" />
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" />
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
        <button className="btn" onClick={() => {
          if (name && amount) {
            addChandha(name, phone, street, parseFloat(amount), status)
            setName(''); setPhone(''); setStreet(''); setAmount(''); setStatus('Paid')
          }
        }}>Add Entry</button>
      </div>

      <div className="card">
        <div className="card-title">Collection List</div>
        {chandha.map(c => (
          <div className="list-row" key={c.id}>
            <div><div className="list-row-name">{c.name}</div><div className="list-row-sub">{c.phone} • {c.street}</div></div>
            <div style={{ textAlign: 'right' }}>
              <div className="list-row-amount">₹{c.amount}</div>
              <span className={`status-pill ${c.status === 'Paid' ? 'paid' : 'pending'}`}>{c.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
