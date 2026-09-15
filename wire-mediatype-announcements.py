#!/usr/bin/env python3
path = "src/pages/Dashboard.jsx"

with open(path, "r") as f:
    content = f.read()

old = """function AnnouncementsPanel({ announcementImageUrl, setAnnouncementImageUrl, sendAnnouncement }) {
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
      )}"""

new = """function AnnouncementsPanel({ announcementImageUrl, setAnnouncementImageUrl, sendAnnouncement }) {
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
  }

  const handleUploaded = (url, type) => {
    setAnnouncementImageUrl(url)
    setMediaType(type)
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

      <ImageUploader imageUrl={announcementImageUrl} mediaType={mediaType} onUploaded={handleUploaded} />

      {(message.trim() || announcementImageUrl) && (
        <div className="section-box" style={{ marginBottom: '1.25rem' }}>
          <div className="section-label">Preview</div>
          {announcementImageUrl && (
            mediaType === 'video' ? (
              <video src={announcementImageUrl} controls style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '0.5rem' }} />
            ) : (
              <img src={announcementImageUrl} alt="Preview" style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '0.5rem' }} />
            )
          )}
          {message.trim() && <p style={{ whiteSpace: 'pre-wrap' }}>{message}</p>}
        </div>
      )}"""

if old not in content:
    print("WARNING: exact AnnouncementsPanel block not found, no changes made.")
else:
    content = content.replace(old, new)
    with open(path, "w") as f:
        f.write(content)
    print("AnnouncementsPanel updated with mediaType support.")
