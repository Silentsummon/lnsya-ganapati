#!/usr/bin/env python3
path = "src/store/appStore.js"

with open(path, "r") as f:
    content = f.read()

changes = 0

# 1. Add luckyTokens to initial state
old1 = "  chandha: [],\n  loading: true,"
new1 = "  chandha: [],\n  luckyTokens: [],\n  loading: true,"
if old1 in content:
    content = content.replace(old1, new1)
    changes += 1
    print("1. Added luckyTokens initial state.")
else:
    print("WARNING 1: not found.")

# 2. Add addLuckyToken function (after sendAnnouncement, using same marker as before)
marker = "    return { success: true, total: recipients.length, sent, failed, failedRecipients }\n  },"
func = """    return { success: true, total: recipients.length, sent, failed, failedRecipients }
  },

  fetchLuckyTokens: async () => {
    const { eventId } = get()
    if (!eventId) return
    const { data, error } = await supabase
      .from('lucky_tokens')
      .select('*')
      .eq('event_id', eventId)
      .order('token_number')
    if (error) { console.error('fetchLuckyTokens error:', error); return }
    set({ luckyTokens: data || [] })
  },

  addLuckyToken: async (name, phone) => {
    const { eventId, luckyTokens } = get()
    if (!eventId) return
    const { data, error } = await supabase
      .from('lucky_tokens')
      .insert([{ event_id: eventId, name, phone }])
      .select()
      .single()
    if (error || !data) { console.error('addLuckyToken error:', error); return }
    set({ luckyTokens: [...luckyTokens, data] })
  },"""

if marker not in content:
    print("WARNING 2: marker not found, no changes made for this step.")
elif "addLuckyToken:" in content:
    print("2. addLuckyToken already exists, skipping.")
else:
    content = content.replace(marker, func)
    changes += 1
    print("2. Added fetchLuckyTokens and addLuckyToken functions.")

if changes == 2:
    with open(path, "w") as f:
        f.write(content)
    print("Both steps applied. File saved.")
else:
    print(f"Only {changes}/2 steps applied. NOT saved. Check warnings.")
