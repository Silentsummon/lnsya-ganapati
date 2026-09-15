#!/usr/bin/env python3
path = "src/pages/Dashboard.jsx"

with open(path, "r") as f:
    content = f.read()

old = """function AnnouncementsPanel({ announcementImageUrl, setAnnouncementImageUrl, sendAnnouncement }) {
  const [message, setMessage] = useState('')
  const [mediaType, setMediaType] = useState('image')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)

  const handleSend = async () => {
    if (!message.trim()) return
    setSending(true)
    setResult(null)
    const res = await sendAnnouncement(message, announcementImageUrl, mediaType)
    setSending(false)
    setResult(res)
  }"""

new = """function AnnouncementsPanel({ announcementImageUrl, setAnnouncementImageUrl, sendAnnouncement }) {
  const [message, setMessage] = useState('')
  const [mediaType, setMediaType] = useState('image')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)
  const [testPhone, setTestPhone] = useState('')

  const handleSend = async () => {
    if (!message.trim()) return
    setSending(true)
    setResult(null)
    const res = await sendAnnouncement(message, announcementImageUrl, mediaType, testPhone)
    setSending(false)
    setResult(res)
  }"""

if old not in content:
    print("WARNING: exact block not found, no changes made.")
else:
    content = content.replace(old, new)

old2 = """      <button className="btn" style={{ width: '100%' }} disabled={sending || !message.trim()} onClick={handleSend}>
        {sending ? 'Sending...' : 'Send Announcement'}
      </button>"""

new2 = """      <div className="section-box" style={{ marginBottom: '1.25rem' }}>
        <div className="section-label">Test Phone (optional)</div>
        <input
          className="mini-input"
          type="tel"
          inputMode="numeric"
          value={testPhone}
          onChange={e => setTestPhone(e.target.value.replace(/\\D/g, '').slice(0, 10))}
          placeholder="Leave empty to send to everyone"
          disabled={sending}
        />
        {testPhone && <div style={{ marginTop: '0.4rem', fontSize: '0.78rem', color: '#b45309' }}>Will send ONLY to this number, not the full list.</div>}
      </div>

      <button className="btn" style={{ width: '100%' }} disabled={sending || !message.trim()} onClick={handleSend}>
        {sending ? 'Sending...' : (testPhone ? 'Send Test to This Number' : 'Send Announcement')}
      </button>"""

if old2 not in content:
    print("WARNING 2: button block not found, no changes made for this part.")
else:
    content = content.replace(old2, new2)

with open(path, "w") as f:
    f.write(content)
print("Test phone field added to AnnouncementsPanel.")
