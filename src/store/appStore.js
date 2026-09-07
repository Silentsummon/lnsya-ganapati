import { create } from 'zustand'
import { supabase, ORGANIZATION_ID } from '../lib/supabase'

export const useAppStore = create((set, get) => ({
  eventId: null,
  totalDays: 0,
  poojasDays: [],
  poojaPeople: {},
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

        const { data: people } = await supabase
          .from('pooja_people')
          .select('*')
          .eq('event_id', event.id)
        const grouped = {}
        ;(people || []).forEach(p => {
          if (!grouped[p.day_id]) grouped[p.day_id] = []
          grouped[p.day_id].push(p)
        })
        set({ poojaPeople: grouped })

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
    const { eventId, poojasDays } = get()
    if (!eventId) return
    const { error } = await supabase.from('events').update({ total_days: days }).eq('id', eventId)
    if (error) { console.error('setTotalDays error:', error); return }
    set({ totalDays: days })

    const samples = ['Flowers, incense & coconut', 'Banana & jaggery', 'Rice & dal', 'Sweets & dairy']
    for (let i = poojasDays.length + 1; i <= days; i++) {
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

  addPerson: async (dayId, name, phone, lane) => {
    const { eventId, poojaPeople } = get()
    const existing = poojaPeople[dayId] || []
    if (existing.length >= 2) return
    const { data, error } = await supabase
      .from('pooja_people')
      .insert([{ event_id: eventId, day_id: dayId, name, phone, lane }])
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
  },
}))
