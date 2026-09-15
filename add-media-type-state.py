#!/usr/bin/env python3
path = "src/store/appStore.js"

with open(path, "r") as f:
    content = f.read()

old = "  announcementImageUrl: null,\n  setAnnouncementImageUrl: (url) => set({ announcementImageUrl: url }),"
new = """  announcementImageUrl: null,
  setAnnouncementImageUrl: (url) => set({ announcementImageUrl: url }),
  announcementMediaType: 'image',
  setAnnouncementMediaType: (type) => set({ announcementMediaType: type }),"""

if "announcementMediaType" in content:
    print("Already applied, skipping.")
elif old not in content:
    print("WARNING: expected block not found.")
else:
    content = content.replace(old, new)
    with open(path, "w") as f:
        f.write(content)
    print("Added announcementMediaType state.")
