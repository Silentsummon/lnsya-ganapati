#!/usr/bin/env python3
path = "src/store/appStore.js"

with open(path, "r") as f:
    content = f.read()

old = "        set({ chandha: chandha || [] })"
new = """        set({ chandha: chandha || [] })

        const { data: luckyTokensInit } = await supabase
          .from('lucky_tokens')
          .select('*')
          .eq('event_id', event.id)
          .order('token_number')
        set({ luckyTokens: luckyTokensInit || [] })"""

if "luckyTokensInit" in content:
    print("Already applied, skipping.")
elif old not in content:
    print("WARNING: expected line not found, no changes made.")
else:
    content = content.replace(old, new, 1)
    with open(path, "w") as f:
        f.write(content)
    print("Added lucky_tokens fetch to init().")
