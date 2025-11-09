// client/app/chat/[channel].tsx
import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { socketService } from "../../services/SocketService";
import MessageList from "../../components/MessageList";
import MessageInput from "../../components/MessageInput";
import type { ChannelId, Message } from "../../types/chat";

function createRandomId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const channelId = (params.channel as ChannelId) || "general";

  const [messages, setMessages] = useState<Message[]>([]);
  const userIdRef = useRef<string>(createRandomId());
  const userName = "Sergey Onoprichuk";

  useEffect(() => {
    // connect socket
    socketService.connect();

    // simple "auth"
    socketService.emit("auth:login", {
      userId: userIdRef.current,
      name: userName,
    });

    // join channel
    socketService.emit("channel:join", { channelId });

    const handleHistory = (history: Message[]) => {
      setMessages(history);
    };

    const handleNewMessage = (message: Message) => {
      setMessages((prev) => {
        const index = prev.findIndex((m) => m.id === message.id);

        if (index !== -1) {
          const copy = [...prev];
          copy[index] = message;
          return copy;
        }

        return [...prev, message];
      });
    };

    socketService.on("channel:history", handleHistory);
    socketService.on("message:new", handleNewMessage);

    return () => {
      socketService.off("channel:history", handleHistory);
      socketService.off("message:new", handleNewMessage);
    };
  }, [channelId]);

  const handleSend = (text: string) => {
    const tempId = createRandomId();

    // optimistic message
    const optimistic: Message = {
      id: tempId,
      channelId,
      userId: userIdRef.current,
      userName,
      text,
      createdAt: new Date().toISOString(),
      status: "sending",
      edited: false,
      deleted: false,
      reactions: {},
    };

    setMessages((prev) => [...prev, optimistic]);

    socketService.emit("message:send", {
      tempId,
      channelId,
      text,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>#{channelId}</Text>
      </View>
      <View style={styles.messages}>
        <MessageList messages={messages} />
      </View>
      <MessageInput onSend={handleSend} />
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
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#e5e7eb",
  },
  messages: {
    flex: 1,
  },
});
