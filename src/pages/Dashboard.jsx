import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore'
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
    totalDays, setTotalDays, poojasDays, updatePoojaDay, setAllDates,
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
          setAllDates={setAllDates}
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
            <button className={`tab ${tab === 'updates' ? 'active' : ''}`} onClick={() => setTab('updates')}>Utsav Schedule</button>
            <button className={`tab ${tab === 'chandha' ? 'active' : ''}`} onClick={() => setTab('chandha')}>Chandha</button>
          </div>
          {tab === 'updates' && <VolunteerUpdates days={visibleDays} poojaPeople={poojaPeople} />}
          {tab === 'chandha' && <VolunteerChandha chandha={chandha} addChandha={addChandha} />}
        </>
      )}
    </div>
  )
}

function PresidentPanel({ totalDays, setTotalDays, days, updatePoojaDay, poojaPeople, addPerson, deletePerson, setAllDates }) {
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

      <StartDateSetter setAllDates={setAllDates} />

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

function VolunteerUpdates({ days, poojaPeople }) {
  return (
    <div>
      {days.map(day => {
        const dateLabel = formatDate(day.pooja_date)
        const people = poojaPeople[day.id] || []
        return (
          <div className="card" key={day.id}>
            <div className="card-title">Day {day.day_number}{dateLabel ? ` · ${dateLabel}` : ''}</div>
            <div className="day-body-label">What to Bring</div>
            <div className="day-body-text">{day.what_to_bring}</div>
            <div className="day-body-label" style={{ marginTop: '0.7rem' }}>Pooja People</div>
            {people.length === 0 && <div className="day-body-text" style={{ opacity: 0.6 }}>Not assigned yet</div>}
            {people.map(p => (
              <div key={p.id} className="day-body-text" style={{ marginBottom: '0.2rem' }}>
                {p.name} — {p.phone} • {p.lane}
              </div>
            ))}
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
  const [expandedId, setExpandedId] = useState(null)

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.6rem' }}>
          <div className="card-title" style={{ marginBottom: 0 }}>Collection List</div>
          <div className="btn-row">
            <button className="btn" onClick={exportCSV} style={{ fontSize: '0.7rem', padding: '0.5rem 1rem' }}>Export CSV</button>
            <button className="btn" onClick={exportPDF} style={{ fontSize: '0.7rem', padding: '0.5rem 1rem' }}>Export PDF</button>
          </div>
        </div>

        {chandha.length === 0 && <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>No entries yet.</p>}

        {chandha.map(c => {
          const isOpen = expandedId === c.id
          return (
            <div key={c.id} style={{ marginBottom: '0.5rem' }}>
              <div
                className="list-row"
                style={{ cursor: 'pointer', marginBottom: isOpen ? 0 : undefined, borderBottomLeftRadius: isOpen ? 0 : undefined, borderBottomRightRadius: isOpen ? 0 : undefined }}
                onClick={() => setExpandedId(isOpen ? null : c.id)}
              >
                <div><div className="list-row-name">{c.name}</div><div className="list-row-sub">{c.phone} • {c.street}</div></div>
                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div>
                    <div className="list-row-amount">₹{c.amount}</div>
                    <span className={`status-pill ${c.status === 'Paid' ? 'paid' : 'pending'}`}>{c.status}</span>
                  </div>
                  <span style={{ fontSize: '0.9rem', transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', opacity: 0.7 }}>&#8250;</span>
                </div>
              </div>
              {isOpen && (
                <div style={{
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)', borderTop: 'none',
                  borderBottomLeftRadius: '0.6rem', borderBottomRightRadius: '0.6rem',
                  padding: '0.8rem 1rem', fontSize: '0.8rem',
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.6rem' }}>
                    <div><span style={{ opacity: 0.6 }}>Full Name:</span> <strong>{c.name}</strong></div>
                    <div><span style={{ opacity: 0.6 }}>Phone:</span> <strong>{c.phone || '-'}</strong></div>
                    <div><span style={{ opacity: 0.6 }}>Street:</span> <strong>{c.street || '-'}</strong></div>
                    <div><span style={{ opacity: 0.6 }}>Amount:</span> <strong>₹{c.amount}</strong></div>
                    <div><span style={{ opacity: 0.6 }}>Status:</span> <strong>{c.status}</strong></div>
                    <div><span style={{ opacity: 0.6 }}>Date Added:</span> <strong>{formatDate(c.created_at)}</strong></div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
