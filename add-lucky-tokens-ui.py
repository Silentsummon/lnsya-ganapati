#!/usr/bin/env python3
path = "src/pages/Dashboard.jsx"

with open(path, "r") as f:
    content = f.read()

changes = 0

# 1. Destructure luckyTokens, addLuckyToken in Dashboard
old1 = """    announcementImageUrl, setAnnouncementImageUrl, sendAnnouncement,
  } = useAppStore()"""
new1 = """    announcementImageUrl, setAnnouncementImageUrl, sendAnnouncement,
    luckyTokens, addLuckyToken,
  } = useAppStore()"""
if old1 in content:
    content = content.replace(old1, new1)
    changes += 1
    print("1. Destructured luckyTokens, addLuckyToken.")
else:
    print("WARNING 1: not found.")

# 2. Pass into <PresidentPanel />
old2 = """          sendAnnouncement={sendAnnouncement}
        />"""
new2 = """          sendAnnouncement={sendAnnouncement}
          luckyTokens={luckyTokens} addLuckyToken={addLuckyToken}
        />"""
if old2 in content:
    content = content.replace(old2, new2)
    changes += 1
    print("2. Passed luckyTokens, addLuckyToken into <PresidentPanel />.")
else:
    print("WARNING 2: not found.")

# 3. Update PresidentPanel signature
old3 = "function PresidentPanel({ totalDays, setTotalDays, days, updatePoojaDay, updateEvents, setAllDates, chandha, broadcastToChandha, announcementImageUrl, setAnnouncementImageUrl, sendAnnouncement }) {"
new3 = "function PresidentPanel({ totalDays, setTotalDays, days, updatePoojaDay, updateEvents, setAllDates, chandha, broadcastToChandha, announcementImageUrl, setAnnouncementImageUrl, sendAnnouncement, luckyTokens, addLuckyToken }) {"
if old3 in content:
    content = content.replace(old3, new3)
    changes += 1
    print("3. Updated PresidentPanel signature.")
else:
    print("WARNING 3: not found.")

# 4. Add third tab button
old4 = """        <button className={`tab ${presTab === 'announcements' ? 'active' : ''}`} onClick={() => setPresTab('announcements')}>Announcements</button>
      </div>"""
new4 = """        <button className={`tab ${presTab === 'announcements' ? 'active' : ''}`} onClick={() => setPresTab('announcements')}>Announcements</button>
        <button className={`tab ${presTab === 'lucky' ? 'active' : ''}`} onClick={() => setPresTab('lucky')}>Lucky Tokens</button>
      </div>"""
if old4 in content:
    content = content.replace(old4, new4)
    changes += 1
    print("4. Added Lucky Tokens tab button.")
else:
    print("WARNING 4: not found.")

# 5. Render LuckyTokensPanel + define the component
old5 = """      {presTab === 'announcements' && (
        <AnnouncementsPanel
          announcementImageUrl={announcementImageUrl}
          setAnnouncementImageUrl={setAnnouncementImageUrl}
          sendAnnouncement={sendAnnouncement}
        />
      )}
    </div>
  )
}"""
new5 = """      {presTab === 'announcements' && (
        <AnnouncementsPanel
          announcementImageUrl={announcementImageUrl}
          setAnnouncementImageUrl={setAnnouncementImageUrl}
          sendAnnouncement={sendAnnouncement}
        />
      )}

      {presTab === 'lucky' && (
        <LuckyTokensPanel luckyTokens={luckyTokens} addLuckyToken={addLuckyToken} />
      )}
    </div>
  )
}

function LuckyTokensPanel({ luckyTokens, addLuckyToken }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
  }

  const handleAdd = async () => {
    if (submitting) return
    if (!name.trim()) return
    setSubmitting(true)
    await addLuckyToken(name.trim(), phone.trim())
    setName(''); setPhone('')
    setSubmitting(false)
  }

  const exportCSV = () => {
    const headers = ['Token No', 'Name', 'Phone', 'Date Added']
    const rows = luckyTokens.map(t => [t.token_number, t.name, t.phone, formatDate(t.created_at)])
    const csvContent = [headers, ...rows]
      .map(row => row.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(','))
      .join(String.fromCharCode(10))
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `lucky-tokens-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div>
      <div className="section-box" style={{ marginBottom: '1.25rem' }}>
        <div className="section-label">Add Lucky Token Entry</div>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter name" style={{ marginBottom: '0.75rem' }} />
        <input type="tel" inputMode="numeric" value={phone} onChange={e => setPhone(e.target.value.replace(/\\D/g, '').slice(0, 10))} placeholder="Enter 10-digit number" style={{ marginBottom: '0.75rem' }} />
        <button className="btn" style={{ width: '100%' }} disabled={submitting || !name.trim()} onClick={handleAdd}>
          {submitting ? 'Adding...' : 'Add Entry'}
        </button>
      </div>

      <div className="btn-row" style={{ marginBottom: '1.25rem' }}>
        <button className="btn" style={{ flex: 1, background: '#ffffff', color: '#1a1a1a', border: '1px solid #d4d4d4' }} onClick={exportCSV}>
          Export as CSV
        </button>
      </div>

      <div className="card">
        <div className="card-title" style={{ color: '#1a1a1a' }}>Lucky Token Entries ({luckyTokens.length})</div>
        {luckyTokens.length === 0 && <p style={{ color: '#6b6b6b', fontSize: '0.85rem' }}>No entries yet.</p>}
        {luckyTokens.map(t => (
          <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
            <span style={{ fontWeight: 700 }}>#{t.token_number}</span>
            <span>{t.name}</span>
            <span>{t.phone || '-'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}"""
if old5 in content:
    content = content.replace(old5, new5)
    changes += 1
    print("5. Rendered LuckyTokensPanel and defined the component.")
else:
    print("WARNING 5: not found.")

if changes == 5:
    with open(path, "w") as f:
        f.write(content)
    print("All 5 steps applied. File saved.")
else:
    print(f"Only {changes}/5 steps applied. NOT saved. Check warnings.")
