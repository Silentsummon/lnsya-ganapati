#!/usr/bin/env python3
path = "src/pages/Dashboard.jsx"

with open(path, "r") as f:
    content = f.read()

changes = 0

render_line = "      <StartDateSetter setAllDates={setAllDates} />\n"
if render_line in content:
    content = content.replace(render_line, "")
    changes += 1
    print("Removed the <StartDateSetter /> render line.")
else:
    print("WARNING: render line not found exactly as expected, skipped.")

component_block = """function StartDateSetter({ setAllDates }) {
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

"""

if component_block in content:
    content = content.replace(component_block, "")
    changes += 1
    print("Removed the StartDateSetter function block.")
else:
    print("WARNING: component block not found exactly as expected, skipped.")

if changes == 2:
    with open(path, "w") as f:
        f.write(content)
    print("File saved. Both removals successful.")
else:
    print("NOT saved - one or both blocks were not found. No changes made to be safe.")
