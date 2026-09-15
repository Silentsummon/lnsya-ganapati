#!/usr/bin/env python3
path = "src/pages/Dashboard.jsx"

with open(path, "r") as f:
    content = f.read()

anchor = "function AnnouncementsPanel({ announcementImageUrl, setAnnouncementImageUrl, sendAnnouncement }) {"

if anchor not in content:
    print("ERROR: anchor not found, cannot proceed.")
else:
    parts = content.split(anchor, 1)
    before = parts[0]
    after = anchor + parts[1]

    # Insert the lucky tab render right before the final closing of PresidentPanel
    # Find the last "    </div>\n  )\n}\n\n" right before our anchor in 'before'
    closing_marker = "    </div>\n  )\n}\n\n"
    idx = before.rfind(closing_marker)
    if idx == -1:
        print("ERROR: closing marker not found in 'before' section.")
    else:
        insertion = """      {presTab === 'lucky' && (
        <LuckyTokensPanel luckyTokens={luckyTokens} addLuckyToken={addLuckyToken} />
      )}
"""
        # Insert right before the closing_marker
        before = before[:idx] + insertion + before[idx:]

        lucky_component = """function LuckyTokensPanel({ luckyTokens, addLuckyToken }) {
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
}

"""
        content = before + lucky_component + after
        with open(path, "w") as f:
            f.write(content)
        print("Success: LuckyTokensPanel rendered and defined.")
