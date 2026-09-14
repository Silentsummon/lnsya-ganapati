#!/usr/bin/env python3
path = "src/store/appStore.js"

with open(path, "r") as f:
    content = f.read()

old = """  chandha: [],
  loading: true,
  error: null,"""

new = """  chandha: [],
  loading: true,
  error: null,
  announcementImageUrl: null,
  setAnnouncementImageUrl: (url) => set({ announcementImageUrl: url }),"""

if old not in content:
    print("WARNING: expected state block not found, no changes made.")
else:
    content = content.replace(old, new)
    with open(path, "w") as f:
        f.write(content)
    print("Added announcementImageUrl state and setter.")
