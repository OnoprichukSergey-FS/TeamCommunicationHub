// client/app/chat/[channel].tsx
import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { socketService } from "../../services/SocketService";
import { MessageStorage } from "../../services/MessageStorage";
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
    let isMounted = true;

    // 1. Load local history from SQLite
    MessageStorage.getMessagesByChannel(channelId)
      .then((stored) => {
        if (isMounted) {
          setMessages(stored);
        }
      })
      .catch((err) => {
        console.log("Error loading stored messages", err);
      });

    // 2. Connect socket + auth + join channel
    socketService.connect();

    socketService.emit("auth:login", {
      userId: userIdRef.current,
      name: userName,
    });

    socketService.emit("channel:join", { channelId });

    const handleNewMessage = (message: Message) => {
      setMessages((prev) => {
        const index = prev.findIndex((m) => m.id === message.id);
        let next: Message[];

        if (index !== -1) {
          next = [...prev];
          next[index] = message;
        } else {
          next = [...prev, message];
        }

        // Save the latest version of this message to SQLite
        MessageStorage.saveMessage(message);
        return next;
      });
    };

    socketService.on("message:new", handleNewMessage);

    return () => {
      isMounted = false;
      socketService.off("message:new", handleNewMessage);
    };
  }, [channelId]);

  const handleSend = (text: string) => {
    const tempId = createRandomId();

    // Optimistic local message (not saved to DB yet)
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
