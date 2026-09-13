#!/usr/bin/env python3
import sys

path = "src/store/appStore.js"

old = """    const day = poojasDays.find(d => d.id === dayId)
    const poojaDate = day?.pooja_date
      ? new Date(day.pooja_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', weekday: 'long' })
      : `Day ${day?.day_number}`"""

new = """    const day = poojasDays.find(d => d.id === dayId)
    const poojaDate = day?.pooja_date
      ? formatPoojaDate(day.pooja_date)
      : `Day ${day?.day_number}`"""

with open(path, "r") as f:
    content = f.read()

if old not in content:
    print("ERROR: exact block not found — file may have changed. No edits made.")
    sys.exit(1)

content = content.replace(old, new)

import_line = "import { triggerWhatsAppSend, triggerPoojaConfirmation } from '../lib/whatsapp'"
helper = """import { triggerWhatsAppSend, triggerPoojaConfirmation } from '../lib/whatsapp'

function formatPoojaDate(dateStr) {
  const d = new Date(dateStr)
  const day = d.getDate()
  const suffix = (day % 10 === 1 && day !== 11) ? 'st'
    : (day % 10 === 2 && day !== 12) ? 'nd'
    : (day % 10 === 3 && day !== 13) ? 'rd'
    : 'th'
  const month = d.toLocaleDateString('en-IN', { month: 'short' })
  const year = d.getFullYear()
  const weekday = d.toLocaleDateString('en-IN', { weekday: 'long' })
  return `${day}${suffix} ${month} ${year}, ${weekday}`
}"""

if import_line not in content:
    print("ERROR: import line not found — helper not added. checkInSlot was still updated though.")
else:
    content = content.replace(import_line, helper)

with open(path, "w") as f:
    f.write(content)

print("Date formatting updated. Example output: 15th Sep 2026, Tuesday")
