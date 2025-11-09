// server/index.js
const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const channels = ["general", "development", "random"];
const messagesByChannel = {
  general: [],
  development: [],
  random: [],
};

// Presence + typing tracking
const usersBySocket = {}; // socket.id -> { userId, name }
const usersById = {}; // userId -> { id, name, status, lastSeen }

const channelMembers = {
  general: new Set(),
  development: new Set(),
  random: new Set(),
};

const typingByChannel = {
  general: new Set(),
  development: new Set(),
  random: new Set(),
};

function broadcastChannelUserCounts() {
  const summary = channels.map((channelId) => ({
    channelId,
    userCount: channelMembers[channelId].size,
  }));
  console.log("Broadcasting channel:userCounts", summary);
  io.emit("channel:userCounts", summary);
}

function broadcastChannelPresence(channelId) {
  const users = Array.from(channelMembers[channelId]).map((userId) => {
    const u = usersById[userId];
    return {
      id: userId,
      name: u?.name || "Unknown",
      status: u?.status || "offline",
      lastSeen: u?.lastSeen || null,
    };
  });

  io.to(channelId).emit("presence:update", { channelId, users });
}

function broadcastTyping(channelId) {
  const users = Array.from(typingByChannel[channelId]).map((userId) => {
    const u = usersById[userId];
    return {
      id: userId,
      name: u?.name || "Unknown",
    };
  });

  io.to(channelId).emit("typing:update", { channelId, users });
}

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("auth:login", ({ userId, name }) => {
    usersBySocket[socket.id] = { userId, name };

    if (!usersById[userId]) {
      usersById[userId] = {
        id: userId,
        name,
        status: "online",
        lastSeen: new Date().toISOString(),
      };
    } else {
      usersById[userId].name = name;
      usersById[userId].status = "online";
    }

    console.log("User logged in:", userId, name);
  });

  socket.on("channel:join", ({ channelId }) => {
    if (!channels.includes(channelId)) return;

    const user = usersBySocket[socket.id];
    if (!user) return;
    const userId = user.userId;

    socket.join(channelId);
    console.log(`Socket ${socket.id} joined channel ${channelId}`);

    channelMembers[channelId].add(userId);
    broadcastChannelUserCounts();
    broadcastChannelPresence(channelId);

    const history = messagesByChannel[channelId] || [];
    socket.emit("channel:history", history);
  });

  socket.on("channel:getUserCounts", () => {
    console.log("Received channel:getUserCounts");
    broadcastChannelUserCounts();
  });

  socket.on("presence:get", ({ channelId }) => {
    if (!channels.includes(channelId)) return;
    broadcastChannelPresence(channelId);
  });

  socket.on("typing:start", ({ channelId }) => {
    if (!channels.includes(channelId)) return;
    const user = usersBySocket[socket.id];
    if (!user) return;
    typingByChannel[channelId].add(user.userId);
    broadcastTyping(channelId);
  });

  socket.on("typing:stop", ({ channelId }) => {
    if (!channels.includes(channelId)) return;
    const user = usersBySocket[socket.id];
    if (!user) return;
    typingByChannel[channelId].delete(user.userId);
    broadcastTyping(channelId);
  });

  // inside io.on("connection", (socket) => { ... })

  socket.on("message:send", ({ tempId, channelId, text }) => {
    if (!channels.includes(channelId)) return;

    const trimmed = (text ?? "").toString().trim();
    if (!trimmed) return;

    //  use client tempId when possible so don't duplicate
    const messageId =
      tempId || Date.now().toString() + Math.random().toString(36).slice(2);

    const message = {
      id: messageId,
      channelId,
      userId: usersBySocket[socket.id]?.userId || socket.id,
      userName: usersBySocket[socket.id]?.name || "Guest",
      text: trimmed,
      createdAt: new Date().toISOString(),
      status: "delivered",
      edited: false,
      deleted: false,
      reactions: {},
    };

    if (!messagesByChannel[channelId]) {
      messagesByChannel[channelId] = [];
    }
    messagesByChannel[channelId].push(message);

    // deliver to people in the channel
    io.to(channelId).emit("message:new", message);

    // also notify all clients that this channel had activity (for unread)
    io.emit("channel:activity", { channelId });
  });

  socket.on("disconnect", () => {
    const user = usersBySocket[socket.id];
    if (user) {
      const userId = user.userId;
      const u = usersById[userId];

      if (u) {
        u.status = "offline";
        u.lastSeen = new Date().toISOString();
      }

      channels.forEach((channelId) => {
        channelMembers[channelId].delete(userId);
        typingByChannel[channelId].delete(userId);
        broadcastChannelPresence(channelId);
        broadcastTyping(channelId);
      });

      broadcastChannelUserCounts();
    }

    console.log("Client disconnected:", socket.id);
    delete usersBySocket[socket.id];
  });
});

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
