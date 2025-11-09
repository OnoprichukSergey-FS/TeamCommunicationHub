const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

app.get("/", (_req, res) => {
  res.send("Team Communication Hub server is running");
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const PORT = process.env.PORT || 4000;

// ---------------- In-memory data ----------------

const channels = ["general", "development", "random"];

// channelId -> Message[]
const messagesByChannel = {
  general: [],
  development: [],
  random: [],
};

// socket.id -> { userId, name, lastSeen }
const usersBySocket = {};

// channelId -> Set<socket.id>
const channelMembers = {
  general: new Set(),
  development: new Set(),
  random: new Set(),
};

// channelId -> Set<socket.id> (currently typing)
const typingByChannel = {
  general: new Set(),
  development: new Set(),
  random: new Set(),
};

// ---------------- Helper functions ----------------

function getUsersInChannel(channelId) {
  const memberSockets = channelMembers[channelId] || new Set();
  const users = [];

  memberSockets.forEach((socketId) => {
    const user = usersBySocket[socketId];
    if (user) {
      users.push({
        id: user.userId,
        name: user.name,
        lastSeen: user.lastSeen || null,
      });
    }
  });

  return users;
}

function broadcastPresence(channelId) {
  const users = getUsersInChannel(channelId);
  io.to(channelId).emit("presence:update", { channelId, users });
}

function sendPresenceToSocket(socket, channelId) {
  const users = getUsersInChannel(channelId);
  socket.emit("presence:update", { channelId, users });
}

function emitTyping(channelId) {
  const typingSockets = typingByChannel[channelId] || new Set();
  const users = [];

  typingSockets.forEach((socketId) => {
    const user = usersBySocket[socketId];
    if (user) {
      users.push({ id: user.userId, name: user.name });
    }
  });

  io.to(channelId).emit("typing:update", { channelId, users });
}

// ---------------- Socket.io logic ----------------

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Simple auth: remember userId + name for this socket
  socket.on("auth:login", ({ userId, name }) => {
    const safeName = (name ?? "").toString().trim() || "Guest";
    const safeUserId = (userId ?? socket.id).toString();

    usersBySocket[socket.id] = {
      userId: safeUserId,
      name: safeName,
      lastSeen: new Date().toISOString(),
    };

    console.log("User logged in:", safeUserId, safeName);
  });

  // Join a channel (room), send history, broadcast presence
  socket.on("channel:join", ({ channelId }) => {
    if (!channels.includes(channelId)) return;

    socket.join(channelId);
    channelMembers[channelId].add(socket.id);

    console.log(`Socket ${socket.id} joined channel ${channelId}`);

    // send history to this socket
    const history = messagesByChannel[channelId] || [];
    socket.emit("channel:history", history);

    // broadcast updated presence to channel
    broadcastPresence(channelId);
  });

  // Leave a channel explicitly
  socket.on("channel:leave", ({ channelId }) => {
    if (!channels.includes(channelId)) return;

    socket.leave(channelId);
    channelMembers[channelId].delete(socket.id);

    // update presence
    broadcastPresence(channelId);

    // stop typing
    typingByChannel[channelId].delete(socket.id);
    emitTyping(channelId);
  });

  // Client asks for presence snapshot
  socket.on("presence:get", ({ channelId }) => {
    if (!channels.includes(channelId)) return;
    sendPresenceToSocket(socket, channelId);
  });

  // Typing
  socket.on("typing:start", ({ channelId }) => {
    if (!channels.includes(channelId)) return;
    typingByChannel[channelId].add(socket.id);
    emitTyping(channelId);
  });

  socket.on("typing:stop", ({ channelId }) => {
    if (!channels.includes(channelId)) return;
    typingByChannel[channelId].delete(socket.id);
    emitTyping(channelId);
  });

  // Main message send
  socket.on("message:send", ({ tempId, channelId, text }) => {
    if (!channels.includes(channelId)) return;

    const trimmed = (text ?? "").toString().trim();
    if (!trimmed) return;

    // use client tempId as final id to avoid duplicates
    const messageId =
      tempId || Date.now().toString() + Math.random().toString(36).slice(2);

    const user = usersBySocket[socket.id] || {
      userId: socket.id,
      name: "Guest",
    };

    const message = {
      id: messageId,
      channelId,
      userId: user.userId,
      userName: user.name,
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

    // send to people in this channel
    io.to(channelId).emit("message:new", message);

    // inform all clients this channel had activity (for unread badges)
    io.emit("channel:activity", { channelId });
  });

  // Message reactions
  socket.on("message:react", ({ channelId, messageId, emoji }) => {
    if (!channels.includes(channelId)) return;
    if (!emoji) return;

    const list = messagesByChannel[channelId] || [];
    const msg = list.find((m) => m.id === messageId);
    if (!msg) return;

    const user = usersBySocket[socket.id] || {
      userId: socket.id,
      name: "Guest",
    };
    const userId = user.userId;

    if (!msg.reactions) msg.reactions = {};

    const current = new Set(msg.reactions[emoji] || []);

    // toggle reaction
    if (current.has(userId)) {
      current.delete(userId);
    } else {
      current.add(userId);
    }

    msg.reactions[emoji] = Array.from(current);

    // broadcast updated message to everyone in channel
    io.to(channelId).emit("message:update", msg);
  });

  // Disconnect cleanup
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);

    const user = usersBySocket[socket.id];
    if (user) {
      user.lastSeen = new Date().toISOString();
    }

    // remove from channels & typing sets
    channels.forEach((channelId) => {
      channelMembers[channelId].delete(socket.id);
      typingByChannel[channelId].delete(socket.id);
      broadcastPresence(channelId);
      emitTyping(channelId);
    });

    delete usersBySocket[socket.id];
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
