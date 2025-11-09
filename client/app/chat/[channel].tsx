import React, { useEffect, useState, useRef, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams, useFocusEffect } from "expo-router";

import { socketService } from "../../services/SocketService";
import { MessageStorage } from "../../services/MessageStorage";
import { UserSettings } from "../../services/UserSettings";
import { ChannelState } from "../../services/ChannelState";

import MessageList from "../../components/MessageList";
import MessageInput from "../../components/MessageInput";
import UserPresence from "../../components/UserPresence";
import TypingIndicator from "../../components/TypingIndicator";

import type { ChannelId, Message, User } from "../../types/chat";

function createRandomId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

type PendingItem = {
  tempId: string;
  channelId: ChannelId;
  text: string;
};

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const channelId: ChannelId =
    (params.channel as ChannelId) || ("general" as ChannelId);

  const [messages, setMessages] = useState<Message[]>([]);
  const [connected, setConnected] = useState<boolean>(
    socketService.isConnected
  );
  const [channelUsers, setChannelUsers] = useState<User[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [userName, setUserName] = useState<string>("Guest");

  const userIdRef = useRef<string>(createRandomId());
  const pendingQueueRef = useRef<PendingItem[]>([]);

  // Reload display name every time this screen is focused
  useFocusEffect(
    useCallback(() => {
      let active = true;
      UserSettings.getUserName().then((stored) => {
        if (active) setUserName(stored || "Guest");
      });
      return () => {
        active = false;
      };
    }, [])
  );

  // Tell ChannelState which channel is active (for unread clearing)
  useEffect(() => {
    ChannelState.setActiveChannel(channelId);
    return () => {
      ChannelState.setActiveChannel(null);
    };
  }, [channelId]);

  useEffect(() => {
    let isMounted = true;

    // Load local history from SQLite
    MessageStorage.getMessagesByChannel(channelId)
      .then((stored) => {
        if (isMounted) setMessages(stored);
      })
      .catch((err) => console.log("Error loading stored messages", err));

    socketService.connect();

    const handleConnect = () => {
      if (!isMounted) return;
      setConnected(true);

      // Flush queued messages
      if (pendingQueueRef.current.length > 0) {
        pendingQueueRef.current.forEach((item) => {
          socketService.emit("message:send", {
            tempId: item.tempId,
            channelId: item.channelId,
            text: item.text,
          });
        });
        pendingQueueRef.current = [];
      }
    };

    const handleDisconnect = () => {
      if (isMounted) setConnected(false);
    };

    socketService.on("connect", handleConnect);
    socketService.on("disconnect", handleDisconnect);

    // Auth + join with current userName
    socketService.emit("auth:login", {
      userId: userIdRef.current,
      name: userName,
    });
    socketService.emit("channel:join", { channelId });
    socketService.emit("presence:get", { channelId });

    // Helper to merge messages without duplicates
    const mergeMessages = (incoming: Message[], current: Message[]) => {
      const map = new Map<string, Message>();
      current.forEach((m) => map.set(m.id, m));
      incoming.forEach((m) => map.set(m.id, m));
      return Array.from(map.values()).sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    };

    const handleHistory = (history: Message[]) => {
      setMessages((prev) => {
        const next = mergeMessages(history, prev);
        history.forEach((m) => MessageStorage.saveMessage(m));
        return next;
      });
    };

    const handleNewMessage = (message: Message) => {
      setMessages((prev) => {
        const next = mergeMessages([message], prev);
        MessageStorage.saveMessage(message);
        return next;
      });
    };

    const handlePresenceUpdate = (payload: {
      channelId: string;
      users: User[];
    }) => {
      if (payload.channelId !== channelId) return;
      setChannelUsers(payload.users);
    };

    const handleTypingUpdate = (payload: {
      channelId: string;
      users: { id: string; name: string }[];
    }) => {
      if (payload.channelId !== channelId) return;
      setTypingUsers(payload.users.map((u) => u.name));
    };

    socketService.on("channel:history", handleHistory);
    socketService.on("message:new", handleNewMessage);
    socketService.on("presence:update", handlePresenceUpdate);
    socketService.on("typing:update", handleTypingUpdate);

    return () => {
      isMounted = false;
      socketService.off("connect", handleConnect);
      socketService.off("disconnect", handleDisconnect);
      socketService.off("channel:history", handleHistory);
      socketService.off("message:new", handleNewMessage);
      socketService.off("presence:update", handlePresenceUpdate);
      socketService.off("typing:update", handleTypingUpdate);
    };
  }, [channelId, userName]);

  const handleSend = (text: string) => {
    const tempId = createRandomId();
    const isOnline = socketService.isConnected;

    const optimistic: Message = {
      id: tempId,
      channelId,
      userId: userIdRef.current,
      userName,
      text,
      createdAt: new Date().toISOString(),
      status: isOnline ? "sent" : "sending",
      edited: false,
      deleted: false,
      reactions: {},
    };

    setMessages((prev) => [...prev, optimistic]);

    if (isOnline) {
      socketService.emit("message:send", {
        tempId,
        channelId,
        text,
      });
    } else {
      pendingQueueRef.current.push({ tempId, channelId, text });
    }
  };

  const handleTypingChange = (isTyping: boolean) => {
    socketService.emit(isTyping ? "typing:start" : "typing:stop", {
      channelId,
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>#{channelId}</Text>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: connected ? "#22c55e" : "#ef4444" },
            ]}
          />
          <Text style={styles.statusText}>
            {connected ? "Online" : "Reconnecting..."}
          </Text>
        </View>
      </View>

      {/* People in this channel */}
      <UserPresence users={channelUsers} />

      {/* Messages */}
      <View style={styles.messages}>
        <MessageList messages={messages} />
      </View>

      {/* Typing */}
      <TypingIndicator names={typingUsers} />

      {/* Input */}
      <MessageInput onSend={handleSend} onTypingChange={handleTypingChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617" },
  header: {
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#1f2937",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#e5e7eb",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: "#9ca3af",
  },
  messages: {
    flex: 1,
  },
});
