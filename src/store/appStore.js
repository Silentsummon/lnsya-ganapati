import { create } from 'zustand'
import { supabase, ORGANIZATION_ID } from '../lib/supabase'
import { triggerWhatsAppSend } from '../lib/whatsapp'

export const useAppStore = create((set, get) => ({
  eventId: null,
  totalDays: 0,
  poojasDays: [],
  poojaCheckins: {},
  budget: 0,
  expenses: [],
  chandha: [],
  loading: true,
  error: null,

  init: async () => {
    try {
      set({ loading: true, error: null })

      let { data: event } = await supabase
        .from('events')
        .select('*')
        .eq('organization_id', ORGANIZATION_ID)
        .maybeSingle()

      if (!event) {
        const { data: newEvent, error } = await supabase
          .from('events')
          .insert([{ organization_id: ORGANIZATION_ID, event_name: 'Ganpati Celebration', total_days: 0 }])
          .select()
          .single()
        if (error) throw error
        event = newEvent
      }

      if (event) {
        set({ eventId: event.id, totalDays: event.total_days || 0 })

        const { data: days } = await supabase
          .from('pooja_days')
          .select('*')
          .eq('event_id', event.id)
          .order('day_number')
        set({ poojasDays: days || [] })

        const dayIds = (days || []).map(d => d.id)
        let people = []
        if (dayIds.length > 0) {
          const { data: peopleData, error: peopleErr } = await supabase
            .from('pooja_people')
            .select('*')
            .in('pooja_day_id', dayIds)
          if (peopleErr) console.error('fetch pooja_people error:', peopleErr)
          people = peopleData || []
        }
        const grouped = {}
        people.forEach(p => {
          if (!grouped[p.pooja_day_id]) grouped[p.pooja_day_id] = []
          grouped[p.pooja_day_id].push(p)
        })
        set({ poojaPeople: grouped })

        let checkins = []
        if (dayIds.length > 0) {
          const { data: checkinData, error: checkinErr } = await supabase
            .from('pooja_checkins')
            .select('*')
            .in('pooja_day_id', dayIds)
            .order('slot_number')
          if (checkinErr) console.error('fetch pooja_checkins error:', checkinErr)
          checkins = checkinData || []
        }
        const checkinMap = {}
        checkins.forEach(c => {
          if (!checkinMap[c.pooja_day_id]) checkinMap[c.pooja_day_id] = []
          checkinMap[c.pooja_day_id].push(c)
        })
        set({ poojaCheckins: checkinMap })

        const { data: budgetData } = await supabase
          .from('budget')
          .select('*')
          .eq('event_id', event.id)
          .maybeSingle()
        if (budgetData) set({ budget: budgetData.total_budget })

        const { data: expenses } = await supabase
          .from('expenses')
          .select('*')
          .eq('event_id', event.id)
          .order('created_at', { ascending: false })
        set({ expenses: expenses || [] })

        const { data: chandha } = await supabase
          .from('chandha_entries')
          .select('*')
          .eq('event_id', event.id)
          .order('created_at', { ascending: false })
        set({ chandha: chandha || [] })
      }

      set({ loading: false })
    } catch (err) {
      console.error('Init error:', err)
      set({ loading: false, error: err.message || 'Failed to load data' })
    }
  },

  setTotalDays: async (days) => {
    const { eventId } = get()
    if (eventId === null || eventId === undefined) return
    const { error } = await supabase.from('events').update({ total_days: days }).eq('id', eventId)
    if (error) { console.error('setTotalDays error:', error); return }
    set({ totalDays: days })

    const { data: existingDays } = await supabase
      .from('pooja_days')
      .select('day_number')
      .eq('event_id', eventId)
    const existingNumbers = new Set((existingDays || []).map(function(d) { return d.day_number }))

    const samples = ['Flowers, incense & coconut', 'Banana & jaggery', 'Rice & dal', 'Sweets & dairy']
    for (let i = 1; i <= days; i++) {
      if (existingNumbers.has(i)) continue
      const { error: insErr } = await supabase.from('pooja_days').insert([{
        event_id: eventId,
        day_number: i,
        what_to_bring: samples[i % samples.length],
      }])
      if (insErr) console.error('pooja_days insert error:', insErr)
    }

    const { data: newDays } = await supabase
      .from('pooja_days')
      .select('*')
      .eq('event_id', eventId)
      .order('day_number')
    set({ poojasDays: newDays || [] })
  },

  updatePoojaDay: async (dayId, whatToBring, announcementTitle, announcementMsg, poojaDate) => {
    const { eventId } = get()
    const payload = {
      what_to_bring: whatToBring,
      announcement_title: announcementTitle || null,
      announcement_message: announcementMsg || null,
    }
    if (poojaDate !== undefined) payload.pooja_date = poojaDate || null

    const { error } = await supabase.from('pooja_days').update(payload).eq('id', dayId)
    if (error) { console.error('updatePoojaDay error:', error); return }

    const { data } = await supabase
      .from('pooja_days')
      .select('*')
      .eq('event_id', eventId)
      .order('day_number')
    set({ poojasDays: data || [] })
  },

  updateEvents: async (dayId, eventsText) => {
    const { eventId } = get()
    const { error } = await supabase
      .from('pooja_days')
      .update({ events_text: eventsText || null })
      .eq('id', dayId)
    if (error) { console.error('updateEvents error:', error); return }

    const { data } = await supabase
      .from('pooja_days')
      .select('*')
      .eq('event_id', eventId)
      .order('day_number')
    set({ poojasDays: data || [] })
  },

  addPerson: async (dayId, name, phone, lane) => {
    const { poojaPeople } = get()
    const existing = poojaPeople[dayId] || []
    if (existing.length >= 2) return
    const { data, error } = await supabase
      .from('pooja_people')
      .insert([{ pooja_day_id: dayId, name, phone, lane }])
      .select()
      .single()
    if (error || !data) { console.error('addPerson error:', error); return }
    set({ poojaPeople: { ...poojaPeople, [dayId]: [...existing, data] } })
  },

  deletePerson: async (dayId, personId) => {
    const { poojaPeople } = get()
    const { error } = await supabase.from('pooja_people').delete().eq('id', personId)
    if (error) { console.error('deletePerson error:', error); return }
    set({ poojaPeople: { ...poojaPeople, [dayId]: (poojaPeople[dayId] || []).filter(p => p.id !== personId) } })
  },

  setAllDates: async (startDate) => {
    const { eventId, poojasDays } = get()
    if (!eventId || !startDate) return
    const base = new Date(startDate + 'T00:00:00')

    const toLocalDateStr = (d) => {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    }

    for (const day of poojasDays) {
      const d = new Date(base)
      d.setDate(d.getDate() + (day.day_number - 1))
      const dateStr = toLocalDateStr(d)
      const { error } = await supabase.from('pooja_days').update({ pooja_date: dateStr }).eq('id', day.id)
      if (error) console.error('setAllDates error:', error)
    }

    const { data } = await supabase
      .from('pooja_days')
      .select('*')
      .eq('event_id', eventId)
      .order('day_number')
    set({ poojasDays: data || [] })
  },

  setBudget: async (amount) => {
    const { eventId } = get()
    if (!eventId) return
    const { data: existing } = await supabase.from('budget').select('id').eq('event_id', eventId).maybeSingle()
    let error
    if (existing) {
      ({ error } = await supabase.from('budget').update({ total_budget: amount }).eq('event_id', eventId))
    } else {
      ({ error } = await supabase.from('budget').insert([{ event_id: eventId, total_budget: amount }]))
    }
    if (error) { console.error('setBudget error:', error); return }
    set({ budget: amount })
  },

  addExpense: async (name, amount, date) => {
    const { eventId, expenses } = get()
    if (!eventId) return
    const { data, error } = await supabase
      .from('expenses')
      .insert([{ event_id: eventId, expense_name: name, amount, expense_date: date }])
      .select()
      .single()
    if (error || !data) { console.error('addExpense error:', error); return }
    set({ expenses: [data, ...expenses] })
  },

  checkInSlot: async (dayId, slotNumber, name, phone, groupSize) => {
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
  },

  addChandha: async (name, phone, street, amount, status) => {
    const { eventId, chandha } = get()
    if (!eventId) return
    const { data, error } = await supabase
      .from('chandha_entries')
      .insert([{ event_id: eventId, name, phone, street, amount, status }])
      .select()
      .single()
    if (error || !data) { console.error('addChandha error:', error); return }
    set({ chandha: [data, ...chandha] })

    triggerWhatsAppSend(phone, name, amount)
  },

  // DUMMY broadcast — logs to console instead of sending via WhatsApp.
  // Swap the inside of this function for a real API call once WhatsApp server is ready.
  broadcastToChandha: async (message) => {
    const { chandha } = get()
    if (!message || !message.trim()) {
      return { success: false, error: 'Message is empty' }
    }

    // Dedupe by phone number, skip blanks
    const seen = new Set()
    const recipients = []
    for (const c of chandha) {
      const phone = (c.phone || '').trim()
      if (!phone) continue
      if (seen.has(phone)) continue
      seen.add(phone)
      recipients.push({ name: c.name, phone })
    }

    // --- DUMMY SEND ---
    console.log('[DUMMY BROADCAST] Message:', message)
    console.log('[DUMMY BROADCAST] Would send to', recipients.length, 'unique numbers:')
    console.table(recipients)
    // --- END DUMMY SEND ---

    return { success: true, count: recipients.length, recipients }
  },
}))
