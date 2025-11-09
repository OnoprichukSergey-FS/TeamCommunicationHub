---



📍 **Location:**  
`TeamCommunicationHub/TESTING_REPORT.md`

📋 **Paste this text inside:**

```markdown
# Testing Report – Team Communication Hub
**Author:** Sergey Onoprichuk  
**Date:** November 9, 2025  

---

## Overview

This document shows all of the main tests I ran to make sure the app worked correctly across web and iOS. I focused on real-time syncing, offline behavior, and the extra features like reactions and unread badges.

---

### Web ↔ iOS Sync

**What I tested:** Sent messages between both devices in the same channel.  
**Result:** Messages appeared instantly on both sides.

---

### Typing Indicator

**What I tested:** Started typing on iOS while watching the web app.  
**Result:** Typing message showed up immediately and disappeared once I stopped.

---

### Presence & Online Status

**What I tested:** Logged in from two devices at once.  
**Result:** Online user count went up and down as expected. Status dot turned green when connected.

---

### Offline Mode

**What I tested:** Turned off Wi-Fi on iPhone, sent a message, then reconnected.  
**Result:** The message showed as “sending” and switched to “sent” automatically after reconnecting.

---

### Unread Channel Messages

**What I tested:** Sent a message to #random while the other device was in #general.  
**Result:** The inactive channel showed “1 unread.” The count cleared after opening that channel.

---

### Emoji Reactions

**What I tested:** Reacted to messages with 👍 and ❤️.  
**Result:** Both reactions synced instantly between web and iOS.

---

### Message Storage

**What I tested:** Closed and reopened the iOS app.  
**Result:** Messages reloaded from local SQLite storage perfectly.

---

### Performance & Stability

**Result:** App stays stable after long sessions.  
**Minor Issue:** Small delay when reconnecting after offline mode (expected behavior).

---

## Summary

All features work correctly and match the requirements. The app feels reliable, and all real-time and offline functionality performs as expected.
