#!/usr/bin/env python3
path = "src/pages/Dashboard.jsx"

with open(path, "r") as f:
    content = f.read()

changes = 0

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
    print("WARNING 1: not found (may already be applied).")

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
    print("WARNING 2: not found (may already be applied).")

old3 = "function PresidentPanel({ totalDays, setTotalDays, days, updatePoojaDay, updateEvents, setAllDates, chandha, broadcastToChandha, announcementImageUrl, setAnnouncementImageUrl, sendAnnouncement }) {"
new3 = "function PresidentPanel({ totalDays, setTotalDays, days, updatePoojaDay, updateEvents, setAllDates, chandha, broadcastToChandha, announcementImageUrl, setAnnouncementImageUrl, sendAnnouncement, luckyTokens, addLuckyToken }) {"
if old3 in content:
    content = content.replace(old3, new3)
    changes += 1
    print("3. Updated PresidentPanel signature.")
else:
    print("WARNING 3: not found (may already be applied).")

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
    print("WARNING 4: not found (may already be applied).")

with open(path, "w") as f:
    f.write(content)
print(f"Saved. {changes}/4 new changes applied this run.")
