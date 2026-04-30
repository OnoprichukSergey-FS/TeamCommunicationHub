import React, { useEffect, useState, useRef, useCallback } from "react";
import { View, Text, StyleSheet, Pressable, SafeAreaView } from "react-native";
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
  const [connected, setConnected] = useState(socketService.isConnected);
  const [channelUsers, setChannelUsers] = useState<User[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [userName, setUserName] = useState("Guest");

  const userIdRef = useRef(createRandomId());
  const pendingQueueRef = useRef<PendingItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      ChannelState.setActiveChannel(channelId);

      UserSettings.getUserName().then((stored) => {
        setUserName(stored || "Guest");
      });

      return () => {
        ChannelState.setActiveChannel(null);
      };
    }, [channelId])
  );

  useEffect(() => {
    let isMounted = true;

    MessageStorage.getMessagesByChannel(channelId).then((stored) => {
      if (isMounted) setMessages(stored);
    });

    socketService.connect();

    const handleConnect = () => {
      setConnected(true);

      socketService.emit("auth:login", {
        userId: userIdRef.current,
        name: userName,
      });

      socketService.emit("channel:join", { channelId });
      socketService.emit("presence:get", { channelId });

      pendingQueueRef.current.forEach((item) => {
        socketService.emit("message:send", item);
      });

      pendingQueueRef.current = [];
    };

    const handleDisconnect = () => {
      setConnected(false);
    };

    const mergeMessages = (incoming: Message[], current: Message[]) => {
      const map = new Map<string, Message>();

      current.forEach((message) => map.set(message.id, message));
      incoming.forEach((message) => map.set(message.id, message));

      return Array.from(map.values()).sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    };

    const handleHistory = (history: Message[]) => {
      setMessages((prev) => {
        const next = mergeMessages(history, prev);
        history.forEach((message) => MessageStorage.saveMessage(message));
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

      const others = payload.users.filter(
        (user) => user.id !== userIdRef.current
      );

      setTypingUsers(others.map((user) => user.name));
    };

    socketService.on("connect", handleConnect);
    socketService.on("disconnect", handleDisconnect);
    socketService.on("channel:history", handleHistory);
    socketService.on("message:new", handleNewMessage);
    socketService.on("message:update", handleMessageUpdate);
    socketService.on("presence:update", handlePresenceUpdate);
    socketService.on("typing:update", handleTypingUpdate);

    socketService.emit("auth:login", {
      userId: userIdRef.current,
      name: userName,
    });

    socketService.emit("channel:join", { channelId });
    socketService.emit("presence:get", { channelId });

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

    const payload = {
      tempId,
      channelId,
      text: cleanText,
    };

    if (isOnline) {
      socketService.emit("message:send", payload);
    } else {
      pendingQueueRef.current.push(payload);
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
    <SafeAreaView style={styles.safe}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#020617",
  },

  container: {
    flex: 1,
    backgroundColor: "#020617",
  },

  header: {
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#020617",
  },

  backButton: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#334155",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
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
    letterSpacing: 1.5,
    marginBottom: 3,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
  },

  userText: {
    color: "#94A3B8",
    fontSize: 13,
    marginTop: 3,
  },

  statusContainer: {
    alignItems: "center",
    minWidth: 74,
  },

  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 5,
  },

  statusText: {
    color: "#9CA3AF",
    fontSize: 11,
    fontWeight: "800",
  },

  messages: {
    flex: 1,
    paddingHorizontal: 8,
    backgroundColor: "#020617",
  },
});
