# Reflection – Team Communication Hub

**Author:** Sergey Onoprichuk  
**Date:** November 9, 2025

---

When I first started this project, I wasn’t sure how real-time chat actually worked behind the scenes. Now I understand how Socket.io handles connections, events, and message syncing. Seeing messages instantly appear on both devices felt like a big win.

The hardest part was managing all the different channels and making sure user presence updated correctly. Sometimes the app would show 0 online even when people were there, so I had to fix event timing and update logic. That process taught me a lot about how front-end state and backend sockets interact.

I also learned a lot from the offline feature. Setting up SQLite on mobile made me realize how apps store data when there’s no internet, and it helped me think more about user experience in bad network conditions.

My extra feature was message reactions. I wanted something fun and interactive that still fit the theme of teamwork. Adding reactions meant figuring out how to update one message across all clients without breaking the message list — it was challenging but satisfying once it worked.

If I had more time, I’d like to improve the unread counter and maybe add push notifications or profile pictures. But overall, I’m proud of how far the app came. It runs smoothly, looks clean, and actually feels like something people could use.

This project helped me grow my understanding of full-stack development, from backend events to frontend user experience. It’s one of the most rewarding projects I’ve done so far.
