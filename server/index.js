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

const channels = ["general", "development", "random"];

const messagesByChannel = {
  general: [],
  development: [],
  random: [],
};

const usersBySocket = {};

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

function getChannelCounts() {
  return {
    general: channelMembers.general.size,
    development: channelMembers.development.size,
    random: channelMembers.random.size,
  };
}

function broadcastChannelCounts() {
  io.emit("channel:counts", getChannelCounts());
}

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
  broadcastChannelCounts();
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

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.emit("channel:counts", getChannelCounts());

  socket.on("auth:login", ({ userId, name }) => {
    const safeName = (name ?? "").toString().trim() || "Guest";
    const safeUserId = (userId ?? socket.id).toString();

    usersBySocket[socket.id] = {
      userId: safeUserId,
      name: safeName,
      lastSeen: new Date().toISOString(),
    };

    console.log("User logged in:", safeUserId, safeName);
    socket.emit("channel:counts", getChannelCounts());
  });

  socket.on("channel:join", ({ channelId }) => {
    if (!channels.includes(channelId)) return;

    socket.join(channelId);
    channelMembers[channelId].add(socket.id);

    const history = messagesByChannel[channelId] || [];
    socket.emit("channel:history", history);

    broadcastPresence(channelId);
  });

  socket.on("channel:leave", ({ channelId }) => {
    if (!channels.includes(channelId)) return;

    socket.leave(channelId);
    channelMembers[channelId].delete(socket.id);

    typingByChannel[channelId].delete(socket.id);
    emitTyping(channelId);
    broadcastPresence(channelId);
  });

  socket.on("presence:get", ({ channelId }) => {
    if (!channels.includes(channelId)) return;
    sendPresenceToSocket(socket, channelId);
    socket.emit("channel:counts", getChannelCounts());
  });

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

  socket.on("message:send", ({ tempId, channelId, text }) => {
    if (!channels.includes(channelId)) return;

    const trimmed = (text ?? "").toString().trim();
    if (!trimmed) return;

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

    messagesByChannel[channelId].push(message);

    io.to(channelId).emit("message:new", message);
    io.emit("channel:activity", { channelId });
  });

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

    if (!msg.reactions) msg.reactions = {};

    const current = new Set(msg.reactions[emoji] || []);

    if (current.has(user.userId)) {
      current.delete(user.userId);
    } else {
      current.add(user.userId);
    }

    msg.reactions[emoji] = Array.from(current);

    io.to(channelId).emit("message:update", msg);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);

    channels.forEach((channelId) => {
      channelMembers[channelId].delete(socket.id);
      typingByChannel[channelId].delete(socket.id);
      broadcastPresence(channelId);
      emitTyping(channelId);
    });

    delete usersBySocket[socket.id];
    broadcastChannelCounts();
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
