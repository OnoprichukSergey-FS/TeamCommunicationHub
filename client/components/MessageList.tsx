import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ListRenderItem,
  Pressable,
} from "react-native";
import type { Message } from "../types/chat";

type Props = {
  messages: Message[];
  onReact?: (messageId: string, emoji: string) => void;
};

const REACTIONS = ["👍", "❤️", "😂"];

export default function MessageList({ messages, onReact }: Props) {
  const renderItem: ListRenderItem<Message> = ({ item }) => {
    const statusLabel =
      item.status === "sending"
        ? "sending..."
        : item.status === "sent"
        ? "sent"
        : "delivered";

    const hasReactions =
      item.reactions && Object.keys(item.reactions).length > 0;

    return (
      <View style={styles.messageRow}>
        <Text style={styles.userName}>{item.userName}</Text>
        <Text style={styles.text}>{item.text}</Text>
        <Text style={styles.meta}>{statusLabel}</Text>

        {/* Reaction buttons */}
        {onReact && (
          <View style={styles.reactionRow}>
            {REACTIONS.map((emoji) => (
              <Pressable
                key={emoji}
                style={styles.reactionButton}
                onPress={() => onReact(item.id, emoji)}
              >
                <Text style={styles.reactionButtonText}>{emoji}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Existing reactions summary */}
        {hasReactions && (
          <View style={styles.reactionSummaryRow}>
            {Object.entries(item.reactions ?? {}).map(
              ([emoji, users]) =>
                users.length > 0 && (
                  <View key={emoji} style={styles.reactionBadge}>
                    <Text style={styles.reactionBadgeText}>
                      {emoji} {users.length}
                    </Text>
                  </View>
                )
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <FlatList
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageRow: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 2,
  },
  text: {
    fontSize: 14,
    color: "#e5e7eb",
  },
  meta: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 2,
  },
  reactionRow: {
    flexDirection: "row",
    marginTop: 4,
  },
  reactionButton: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#374151",
    marginRight: 4,
  },
  reactionButtonText: {
    fontSize: 12,
    color: "#e5e7eb",
  },
  reactionSummaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  reactionBadge: {
    backgroundColor: "#111827",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 4,
    marginTop: 2,
  },
  reactionBadgeText: {
    fontSize: 11,
    color: "#e5e7eb",
  },
});
