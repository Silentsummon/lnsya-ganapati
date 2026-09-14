#!/usr/bin/env python3
path = "src/pages/Dashboard.jsx"

with open(path, "r") as f:
    content = f.read()

changes = 0

old1 = """    totalDays, setTotalDays, poojasDays, updatePoojaDay, updateEvents, setAllDates,
    budget, setBudget, expenses, addExpense,
    chandha, addChandha, broadcastToChandha,
  } = useAppStore()"""
new1 = """    totalDays, setTotalDays, poojasDays, updatePoojaDay, updateEvents, setAllDates,
    budget, setBudget, expenses, addExpense,
    chandha, addChandha, broadcastToChandha,
    announcementImageUrl, setAnnouncementImageUrl,
  } = useAppStore()"""
if old1 in content:
    content = content.replace(old1, new1)
    changes += 1
    print("Step 1: destructured new store values.")
else:
    print("WARNING step 1: not found.")

old2 = """        <PresidentPanel
          totalDays={totalDays} setTotalDays={setTotalDays}
          days={visibleDays} updatePoojaDay={updatePoojaDay} updateEvents={updateEvents}
          setAllDates={setAllDates}
          chandha={chandha} broadcastToChandha={broadcastToChandha}
        />"""
new2 = """        <PresidentPanel
          totalDays={totalDays} setTotalDays={setTotalDays}
          days={visibleDays} updatePoojaDay={updatePoojaDay} updateEvents={updateEvents}
          setAllDates={setAllDates}
          chandha={chandha} broadcastToChandha={broadcastToChandha}
          announcementImageUrl={announcementImageUrl} setAnnouncementImageUrl={setAnnouncementImageUrl}
        />"""
if old2 in content:
    content = content.replace(old2, new2)
    changes += 1
    print("Step 2: passed props into <PresidentPanel />.")
else:
    print("WARNING step 2: not found.")

old3 = "function PresidentPanel({ totalDays, setTotalDays, days, updatePoojaDay, updateEvents, setAllDates, chandha, broadcastToChandha }) {"
new3 = "function PresidentPanel({ totalDays, setTotalDays, days, updatePoojaDay, updateEvents, setAllDates, chandha, broadcastToChandha, announcementImageUrl, setAnnouncementImageUrl }) {"
if old3 in content:
    content = content.replace(old3, new3)
    changes += 1
    print("Step 3: updated PresidentPanel signature.")
else:
    print("WARNING step 3: not found.")

old4 = """      {days.length === 0 && <p style={{ color: 'rgba(255,255,255,0.45)', textAlign: 'center', padding: '2rem 0', fontSize: '0.85rem' }}>Set overall days above to get started</p>}"""
new4 = """      <ImageUploader imageUrl={announcementImageUrl} onUploaded={setAnnouncementImageUrl} />

      {days.length === 0 && <p style={{ color: 'rgba(255,255,255,0.45)', textAlign: 'center', padding: '2rem 0', fontSize: '0.85rem' }}>Set overall days above to get started</p>}"""
if old4 in content:
    content = content.replace(old4, new4)
    changes += 1
    print("Step 4: rendered <ImageUploader /> in PresidentPanel.")
else:
    print("WARNING step 4: not found.")

if changes == 4:
    with open(path, "w") as f:
        f.write(content)
    print("All 4 steps applied. File saved.")
else:
    print(f"Only {changes}/4 steps applied. NOT saved, to avoid partial breakage. Check warnings above.")
