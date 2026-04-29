import React, { useEffect, useState, useRef, useCallback } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useLocalSearchParams, useFocusEffect, useRouter } from "expo-router";

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
  const router = useRouter();
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

  useFocusEffect(
    useCallback(() => {
      let active = true;

      ChannelState.setActiveChannel(channelId);

      UserSettings.getUserName().then((stored) => {
        if (active) setUserName(stored || "Guest");
      });

      return () => {
        active = false;
        ChannelState.setActiveChannel(null);
      };
    }, [channelId])
  );

  useEffect(() => {
    let isMounted = true;

    MessageStorage.getMessagesByChannel(channelId)
      .then((stored) => {
        if (isMounted) setMessages(stored);
      })
      .catch((err) => console.log("Error loading stored messages", err));

    socketService.connect();

    const handleConnect = () => {
      if (!isMounted) return;

      setConnected(true);

      socketService.emit("auth:login", {
        userId: userIdRef.current,
        name: userName,
      });

      socketService.emit("channel:join", { channelId });
      socketService.emit("presence:get", { channelId });

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

    socketService.emit("auth:login", {
      userId: userIdRef.current,
      name: userName,
    });

    socketService.emit("channel:join", { channelId });
    socketService.emit("presence:get", { channelId });

    const mergeMessages = (incoming: Message[], current: Message[]) => {
      const map = new Map<string, Message>();

      current.forEach((m) => map.set(m.id, m));
      incoming.forEach((m) => {
        if (m.id) map.set(m.id, m);
      });

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
        const withoutTemp = prev.filter((m) => m.id !== message.id);
        const next = mergeMessages([message], withoutTemp);
        MessageStorage.saveMessage(message);
        return next;
      });
    };

    const handleMessageUpdate = (message: Message) => {
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

      const otherUsers = payload.users.filter(
        (u) => u.id !== userIdRef.current
      );

      setTypingUsers(otherUsers.map((u) => u.name));
    };

    socketService.on("channel:history", handleHistory);
    socketService.on("message:new", handleNewMessage);
    socketService.on("message:update", handleMessageUpdate);
    socketService.on("presence:update", handlePresenceUpdate);
    socketService.on("typing:update", handleTypingUpdate);

    return () => {
      isMounted = false;

      socketService.emit("typing:stop", { channelId });
      socketService.emit("channel:leave", { channelId });

      socketService.off("connect", handleConnect);
      socketService.off("disconnect", handleDisconnect);
      socketService.off("channel:history", handleHistory);
      socketService.off("message:new", handleNewMessage);
      socketService.off("message:update", handleMessageUpdate);
      socketService.off("presence:update", handlePresenceUpdate);
      socketService.off("typing:update", handleTypingUpdate);
    };
  }, [channelId, userName]);

  const handleSend = (text: string) => {
    const cleanText = text.trim();
    if (!cleanText) return;

    const tempId = createRandomId();
    const isOnline = socketService.isConnected;

    const optimistic: Message = {
      id: tempId,
      channelId,
      userId: userIdRef.current,
      userName,
      text: cleanText,
      createdAt: new Date().toISOString(),
      status: isOnline ? "sent" : "sending",
      edited: false,
      deleted: false,
      reactions: {},
    };

    setMessages((prev) => [...prev, optimistic]);
    MessageStorage.saveMessage(optimistic);

    if (isOnline) {
      socketService.emit("message:send", {
        tempId,
        channelId,
        text: cleanText,
      });
    } else {
      pendingQueueRef.current.push({ tempId, channelId, text: cleanText });
    }
  };

  const handleTypingChange = (isTyping: boolean) => {
    socketService.emit(isTyping ? "typing:start" : "typing:stop", {
      channelId,
    });
  };

  const handleReact = (messageId: string, emoji: string) => {
    socketService.emit("message:react", {
      channelId,
      messageId,
      emoji,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.push("/")} style={styles.backButton}>
          <Text style={styles.backText}>← Channels</Text>
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.badge}>Live Channel</Text>
          <Text style={styles.title}>#{channelId}</Text>
          <Text style={styles.userText}>You: {userName}</Text>
        </View>

        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: connected ? "#22c55e" : "#ef4444" },
            ]}
          />
          <Text style={styles.statusText}>
            {connected ? "Online" : "Reconnecting"}
          </Text>
        </View>
      </View>

      <UserPresence users={channelUsers} />

      <View style={styles.messages}>
        <MessageList messages={messages} onReact={handleReact} />
      </View>

      <TypingIndicator names={typingUsers} />

      <MessageInput onSend={handleSend} onTypingChange={handleTypingChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },

  header: {
    paddingTop: 54,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#1f2937",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  backButton: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#253149",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },

  backText: {
    color: "#A78BFA",
    fontSize: 13,
    fontWeight: "900",
  },

  headerText: {
    flex: 1,
  },

  badge: {
    color: "#8B7CFF",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 3,
  },

  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#F8FAFC",
  },

  userText: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 3,
  },

  statusContainer: {
    alignItems: "center",
  },

  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 5,
  },

  statusText: {
    fontSize: 11,
    color: "#9ca3af",
    fontWeight: "700",
  },

  messages: {
    flex: 1,
  },
});
