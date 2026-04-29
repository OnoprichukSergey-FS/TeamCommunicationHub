import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ListRenderItem,
} from "react-native";
import type { Message } from "../types/chat";

type Props = {
  messages: Message[];
  onReact: (messageId: string, emoji: string) => void;
};

export default function MessageList({ messages, onReact }: Props) {
  const listRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 80);
    }
  }, [messages.length]);

  const renderItem: ListRenderItem<Message> = ({ item }) => {
    const time = new Date(item.createdAt).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

    const reactionEntries = Object.entries(item.reactions || {});

    return (
      <View style={styles.messageCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.userName?.slice(0, 1).toUpperCase() || "G"}
          </Text>
        </View>

        <View style={styles.messageContent}>
          <View style={styles.messageHeader}>
            <Text style={styles.name}>{item.userName || "Guest"}</Text>
            <Text style={styles.time}>{time}</Text>
          </View>

          <Text style={styles.messageText}>
            {item.deleted ? "This message was deleted." : item.text}
          </Text>

          <View style={styles.messageFooter}>
            <Text style={styles.status}>
              {item.status === "sending" ? "⏳ Sending" : "✅ Sent"}
              {item.edited ? " • Edited" : ""}
            </Text>

            <View style={styles.reactionRow}>
              <Pressable onPress={() => onReact(item.id, "🔥")}>
                <Text style={styles.reactionButton}>🔥</Text>
              </Pressable>

              <Pressable onPress={() => onReact(item.id, "👍")}>
                <Text style={styles.reactionButton}>👍</Text>
              </Pressable>

              <Pressable onPress={() => onReact(item.id, "😂")}>
                <Text style={styles.reactionButton}>😂</Text>
              </Pressable>
            </View>
          </View>

          {reactionEntries.length > 0 && (
            <View style={styles.reactions}>
              {reactionEntries.map(([emoji, users]) => (
                <View key={emoji} style={styles.reactionPill}>
                  <Text style={styles.reactionPillText}>
                    {emoji} {Array.isArray(users) ? users.length : users}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  if (messages.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>No messages yet</Text>
        <Text style={styles.emptyText}>Start the conversation below.</Text>
      </View>
    );
  }

  return (
    <FlatList
      ref={listRef}
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    paddingBottom: 24,
  },

  messageCard: {
    flexDirection: "row",
    marginBottom: 16,
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "rgba(139,124,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(139,124,255,0.4)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  avatarText: {
    color: "#A78BFA",
    fontSize: 15,
    fontWeight: "900",
  },

  messageContent: {
    flex: 1,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#253149",
    borderRadius: 18,
    padding: 14,
  },

  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  name: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "900",
  },

  time: {
    color: "#64748B",
    fontSize: 11,
  },

  messageText: {
    color: "#CBD5E1",
    fontSize: 15,
    lineHeight: 21,
  },

  messageFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },

  status: {
    color: "#64748B",
    fontSize: 11,
  },

  reactionRow: {
    flexDirection: "row",
    gap: 8,
  },

  reactionButton: {
    fontSize: 16,
  },

  reactions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },

  reactionPill: {
    backgroundColor: "#0B1220",
    borderWidth: 1,
    borderColor: "#253149",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  reactionPillText: {
    color: "#CBD5E1",
    fontSize: 12,
    fontWeight: "700",
  },

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  emptyTitle: {
    color: "#F8FAFC",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 6,
  },

  emptyText: {
    color: "#94A3B8",
    fontSize: 14,
  },
});
