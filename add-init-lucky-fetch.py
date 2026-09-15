#!/usr/bin/env python3
path = "src/store/appStore.js"

with open(path, "r") as f:
    content = f.read()

old = "        set({ chandha: chandha || [] })"
new = """        set({ chandha: chandha || [] })

        const { data: luckyTokens } = await supabase
          .from('lucky_tokens')
          .select('*')
          .eq('event_id', event.id)
          .order('token_number')
        set({ luckyTokens: luckyTokens || [] })"""

if old not in content:
    print("WARNING: expected line not found, no changes made.")
elif "select('*')\n          .from('lucky_tokens')" in content or content.count("from('lucky_tokens')") > 1:
    print("Lucky tokens fetch may already be in init, please check manually.")
else:
    content = content.replace(old, new, 1)
    with open(path, "w") as f:
        f.write(content)
    print("Added lucky_tokens fetch to init().")
