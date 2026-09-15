#!/usr/bin/env python3
path = "src/pages/Dashboard.jsx"

with open(path, "r") as f:
    content = f.read()

changes = 0

# 1. Remove the textarea from PoojaDayCard's edit form
old1 = """          <div className="section-label" style={{ marginTop: '0.5rem', color: '#1a1a1a' }}>What to Bring</div>
          <textarea className="mini-input" rows={2} value={whatToBring} onChange={e => setWhatToBring(e.target.value)} placeholder="What to bring, instructions, etc." />

          <div className="section-label" style={{ marginTop: '0.5rem', color: '#1a1a1a' }}>Announcement Title</div>"""
new1 = """          <div className="section-label" style={{ marginTop: '0.5rem', color: '#1a1a1a' }}>Announcement Title</div>"""
if old1 in content:
    content = content.replace(old1, new1)
    changes += 1
    print("1. Removed What to Bring textarea from PoojaDayCard.")
else:
    print("WARNING 1: not found.")

# 2. Remove display from VolunteerUpdates
old2 = """            <div className="day-body-label">What to Bring</div>
            <div className="day-body-text">{day.what_to_bring}</div>
            {day.announcement_title && ("""
new2 = """            {day.announcement_title && ("""
if old2 in content:
    content = content.replace(old2, new2)
    changes += 1
    print("2. Removed What to Bring display from VolunteerUpdates.")
else:
    print("WARNING 2: not found.")

with open(path, "w") as f:
    f.write(content)
print(f"Saved. {changes}/2 changes applied.")
