#!/usr/bin/env python3
import sys

path = "src/store/appStore.js"

old = """  checkInSlot: async (dayId, slotNumber, name, phone, groupSize) => {
    const { poojaCheckins } = get()
    const existing = poojaCheckins[dayId] || []
    if (existing.some(c => c.slot_number === slotNumber)) {
      return { success: false, error: 'This slot was just booked by someone else. Please pick another.' }
    }
    const { data, error } = await supabase
      .from('pooja_checkins')
      .insert([{ pooja_day_id: dayId, slot_number: slotNumber, name, phone, group_size: groupSize }])
      .select()
      .single()
    if (error || !data) {
      console.error('checkInSlot error:', error)
      return { success: false, error: 'Could not complete check-in. Please try again.' }
    }
    set({ poojaCheckins: { ...poojaCheckins, [dayId]: [...existing, data] } })
    return { success: true }
  },"""

new = """  checkInSlot: async (dayId, slotNumber, name, phone, groupSize) => {
    const { poojaCheckins, poojasDays } = get()
    const existing = poojaCheckins[dayId] || []
    if (existing.some(c => c.slot_number === slotNumber)) {
      return { success: false, error: 'This slot was just booked by someone else. Please pick another.' }
    }
    const { data, error } = await supabase
      .from('pooja_checkins')
      .insert([{ pooja_day_id: dayId, slot_number: slotNumber, name, phone, group_size: groupSize }])
      .select()
      .single()
    if (error || !data) {
      console.error('checkInSlot error:', error)
      return { success: false, error: 'Could not complete check-in. Please try again.' }
    }
    set({ poojaCheckins: { ...poojaCheckins, [dayId]: [...existing, data] } })

    const day = poojasDays.find(d => d.id === dayId)
    const poojaDate = day?.pooja_date
      ? new Date(day.pooja_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', weekday: 'long' })
      : `Day ${day?.day_number}`

    triggerPoojaConfirmation(phone, name, poojaDate)
    supabase.from('pooja_checkins').update({ message_stage: 'confirmation_sent' }).eq('id', data.id)
      .then(({ error }) => { if (error) console.error('message_stage update error:', error) })

    return { success: true }
  },"""

with open(path, "r") as f:
    content = f.read()

if old not in content:
    print("ERROR: exact checkInSlot block not found — file may have changed. No edits made.")
    sys.exit(1)

content = content.replace(old, new)

with open(path, "w") as f:
    f.write(content)

print("checkInSlot updated successfully.")
