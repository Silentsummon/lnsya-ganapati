#!/usr/bin/env python3
path = "src/pages/Dashboard.jsx"

with open(path, "r") as f:
    content = f.read()

changes = 0

# 1. Pass sendAnnouncement from Dashboard's useAppStore destructuring
old1 = """    chandha, addChandha, broadcastToChandha,
    announcementImageUrl, setAnnouncementImageUrl,
  } = useAppStore()"""
new1 = """    chandha, addChandha, broadcastToChandha,
    announcementImageUrl, setAnnouncementImageUrl, sendAnnouncement,
  } = useAppStore()"""
if old1 in content:
    content = content.replace(old1, new1)
    changes += 1
    print("1. Destructured sendAnnouncement.")
else:
    print("WARNING 1: not found.")

# 2. Pass sendAnnouncement into <PresidentPanel />
old2 = """          announcementImageUrl={announcementImageUrl} setAnnouncementImageUrl={setAnnouncementImageUrl}
        />"""
new2 = """          announcementImageUrl={announcementImageUrl} setAnnouncementImageUrl={setAnnouncementImageUrl}
          sendAnnouncement={sendAnnouncement}
        />"""
if old2 in content:
    content = content.replace(old2, new2)
    changes += 1
    print("2. Passed sendAnnouncement prop into <PresidentPanel />.")
else:
    print("WARNING 2: not found.")

# 3. Update PresidentPanel signature
old3 = "function PresidentPanel({ totalDays, setTotalDays, days, updatePoojaDay, updateEvents, setAllDates, chandha, broadcastToChandha, announcementImageUrl, setAnnouncementImageUrl }) {"
new3 = "function PresidentPanel({ totalDays, setTotalDays, days, updatePoojaDay, updateEvents, setAllDates, chandha, broadcastToChandha, announcementImageUrl, setAnnouncementImageUrl, sendAnnouncement }) {"
if old3 in content:
    content = content.replace(old3, new3)
    changes += 1
    print("3. Updated PresidentPanel signature.")
else:
    print("WARNING 3: not found.")

# 4. Add tab state + restructure body with tab bar, wrap existing content, add Announcements tab
old4 = """  const [editingTotal, setEditingTotal] = useState(false)
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


      <ImageUploader imageUrl={announcementImageUrl} onUploaded={setAnnouncementImageUrl} />

      {days.length === 0 && <p style={{ color: 'rgba(255,255,255,0.45)', textAlign: 'center', padding: '2rem 0', fontSize: '0.85rem' }}>Set overall days above to get started</p>}

      {days.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <PoojaSection days={days} updatePoojaDay={updatePoojaDay} />
          <EventsSection days={days} updateEvents={updateEvents} />
        </div>
      )}
    </div>
  )
}"""

new4 = """  const [editingTotal, setEditingTotal] = useState(false)
  const [totalInput, setTotalInput] = useState(String(totalDays))
  const [presTab, setPresTab] = useState('schedule')

  return (
    <div>
      <div className="tabs">
        <button className={`tab ${presTab === 'schedule' ? 'active' : ''}`} onClick={() => setPresTab('schedule')}>Schedule</button>
        <button className={`tab ${presTab === 'announcements' ? 'active' : ''}`} onClick={() => setPresTab('announcements')}>Announcements</button>
      </div>

      {presTab === 'schedule' && (
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

          {days.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <PoojaSection days={days} updatePoojaDay={updatePoojaDay} />
              <EventsSection days={days} updateEvents={updateEvents} />
            </div>
          )}
        </div>
      )}

      {presTab === 'announcements' && (
        <AnnouncementsPanel
          announcementImageUrl={announcementImageUrl}
          setAnnouncementImageUrl={setAnnouncementImageUrl}
          sendAnnouncement={sendAnnouncement}
        />
      )}
    </div>
  )
}

function AnnouncementsPanel({ announcementImageUrl, setAnnouncementImageUrl, sendAnnouncement }) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)

  const handleSend = async () => {
    if (!message.trim()) return
    setSending(true)
    setResult(null)
    const res = await sendAnnouncement(message, announcementImageUrl)
    setSending(false)
    setResult(res)
  }

  return (
    <div>
      <div className="section-box" style={{ marginBottom: '1.25rem' }}>
        <div className="section-label">Announcement Message</div>
        <textarea
          className="mini-input"
          rows={4}
          style={{ width: '100%', resize: 'vertical' }}
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type your announcement message..."
          disabled={sending}
        />
      </div>

      <ImageUploader imageUrl={announcementImageUrl} onUploaded={setAnnouncementImageUrl} />

      {(message.trim() || announcementImageUrl) && (
        <div className="section-box" style={{ marginBottom: '1.25rem' }}>
          <div className="section-label">Preview</div>
          {announcementImageUrl && (
            <img src={announcementImageUrl} alt="Preview" style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '0.5rem' }} />
          )}
          {message.trim() && <p style={{ whiteSpace: 'pre-wrap' }}>{message}</p>}
        </div>
      )}

      <button className="btn" style={{ width: '100%' }} disabled={sending || !message.trim()} onClick={handleSend}>
        {sending ? 'Sending...' : 'Send Announcement'}
      </button>

      {result && (
        <div className="section-box" style={{ marginTop: '1.25rem' }}>
          <div className="section-label">Result</div>
          <p>Total recipients: {result.total}</p>
          <p>Successfully sent: {result.sent}</p>
          <p>Failed: {result.failed}</p>
          {result.failedRecipients && result.failedRecipients.length > 0 && (
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Failed recipients:</div>
              {result.failedRecipients.map((r, i) => (
                <div key={i} style={{ fontSize: '0.85rem' }}>{r.name} — {r.phone}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}"""

if old4 not in content:
    print("WARNING 4: exact PresidentPanel body not found, no changes made for this step.")
else:
    content = content.replace(old4, new4)
    changes += 1
    print("4. Restructured PresidentPanel with tabs + added AnnouncementsPanel.")

if changes == 4:
    with open(path, "w") as f:
        f.write(content)
    print("All 4 steps applied. File saved.")
else:
    print(f"Only {changes}/4 steps applied. NOT saved. Check warnings.")
