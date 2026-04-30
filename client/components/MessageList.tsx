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

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDate(date: string) {
  const messageDate = new Date(date);
  const today = new Date();

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (messageDate.toDateString() === today.toDateString()) return "Today";
  if (messageDate.toDateString() === yesterday.toDateString())
    return "Yesterday";

  return messageDate.toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export default function MessageList({ messages, onReact }: Props) {
  const listRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 80);
    }
  }, [messages.length]);

  const renderItem: ListRenderItem<Message> = ({ item, index }) => {
    const previousMessage = messages[index - 1];

    const showDateDivider =
      !previousMessage ||
      new Date(previousMessage.createdAt).toDateString() !==
        new Date(item.createdAt).toDateString();

    const reactionEntries = Object.entries(item.reactions || {});

    return (
      <View style={styles.itemWrap}>
        {showDateDivider && (
          <View style={styles.dateDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
            <View style={styles.dividerLine} />
          </View>
        )}

        <View style={styles.messageRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.userName?.slice(0, 1).toUpperCase() || "G"}
            </Text>
          </View>

          <View style={styles.messageMain}>
            <View style={styles.messageHeader}>
              <Text style={styles.name} numberOfLines={1}>
                {item.userName || "Guest"}
              </Text>

              <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
            </View>

            <View style={styles.bubble}>
              <Text
                style={[styles.messageText, item.deleted && styles.deletedText]}
              >
                {item.deleted ? "This message was deleted." : item.text}
              </Text>

              <View style={styles.messageFooter}>
                <Text style={styles.status} numberOfLines={1}>
                  {item.status === "sending" ? "Sending..." : "Sent"}
                  {item.edited ? " • Edited" : ""}
                </Text>

                <View style={styles.reactionRow}>
                  {["🔥", "👍", "😂"].map((emoji) => (
                    <Pressable
                      key={emoji}
                      onPress={() => onReact(item.id, emoji)}
                      style={styles.reactionButton}
                    >
                      <Text style={styles.reactionEmoji}>{emoji}</Text>
                    </Pressable>
                  ))}
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
      showsVerticalScrollIndicator={false}
      horizontal={false}
      alwaysBounceHorizontal={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    width: "100%",
    maxWidth: "100%",
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 24,
    overflow: "hidden",
  },

  itemWrap: {
    width: "100%",
    maxWidth: "100%",
    overflow: "hidden",
  },

  dateDivider: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#253149",
  },

  dateText: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "800",
    marginHorizontal: 10,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  messageRow: {
    width: "100%",
    flexDirection: "row",
    marginBottom: 14,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(139,124,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(139,124,255,0.45)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  avatarText: {
    color: "#A78BFA",
    fontSize: 15,
    fontWeight: "900",
  },

  messageMain: {
    flex: 1,
    minWidth: 0,
  },

  messageHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 5,
  },

  name: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "900",
    flexShrink: 1,
  },

  time: {
    color: "#64748B",
    fontSize: 11,
  },

  bubble: {
    width: "100%",
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#253149",
    borderRadius: 18,
    padding: 13,
  },

  messageText: {
    color: "#CBD5E1",
    fontSize: 15,
    lineHeight: 21,
    flexShrink: 1,
  },

  deletedText: {
    color: "#64748B",
    fontStyle: "italic",
  },

  messageFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    gap: 8,
    flexWrap: "wrap",
  },

  status: {
    color: "#64748B",
    fontSize: 11,
    flexShrink: 1,
  },

  reactionRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },

  reactionButton: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: "#0B1220",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#253149",
  },

  reactionEmoji: {
    fontSize: 14,
  },

  reactions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },

  reactionPill: {
    backgroundColor: "rgba(139,124,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(139,124,255,0.35)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  reactionPillText: {
    color: "#DDD6FE",
    fontSize: 12,
    fontWeight: "800",
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
