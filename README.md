# Team Communication Hub

**Author:** Sergey Onoprichuk  
**Date:** November 9, 2025

This project is called **Team Communication Hub**, and it’s my real-time chat app built for Module 2.8.  
It connects users across web and iOS using **Socket.io** for instant communication. The app includes multiple channels, typing indicators, online status, offline message storage with SQLite, and emoji reactions as an extra feature.

---

## 💬 What the App Does

- Lets people chat in real time across web and iOS
- Has three channels: **#general**, **#development**, and **#random**
- Shows who’s typing and who’s online
- Saves messages locally so nothing disappears offline
- Shows unread message badges for other channels
- Supports message reactions (👍 ❤️ 😂)
- Has a settings screen to update your display name
- Uses a clean, dark, modern design

---

## 🧠 What I Learned

I learned how to handle **real-time updates** between devices and how to manage state changes when users join, leave, or lose connection.  
It also helped me understand how chat apps like Slack or Discord work internally.

---

## ⚙️ Tech Stack

**Client:** React Native (Expo), Expo Router, Socket.io-client, SQLite  
**Server:** Node.js, Express, Socket.io  
**Database:** In-memory on the server + SQLite locally on the device

---

## 🚀 How to Run the Project

### 1. Clone the repo

```bash
git clone https://github.com/OnoprichukSergey-FS/TeamCommunicationHub.git
cd TeamCommunicationHub
```

### 2. Run the server

cd server
npm install
npm run dev

### 3. Run the client

cd ../client
npm install
npx expo start
