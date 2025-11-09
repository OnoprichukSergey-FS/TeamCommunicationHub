import React from "react";
import { FlatList, View, Text, StyleSheet } from "react-native";
import type { Message } from "../types/chat";

type Props = {
  messages: Message[];
};

export default function MessageList({ messages }: Props) {
  return (
    <FlatList
      style={styles.list}
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={styles.user}>{item.userName}</Text>
          <Text style={styles.text}>{item.text}</Text>
          <Text style={styles.meta}>{item.status}</Text>
        </View>
      )}
      contentContainerStyle={styles.listContent}
      keyboardShouldPersistTaps="handled"
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  row: {
    marginBottom: 8,
  },
  user: {
    fontSize: 12,
    color: "#9ca3af",
  },
  text: {
    fontSize: 14,
    color: "#e5e7eb",
  },
  meta: {
    fontSize: 10,
    color: "#6b7280",
  },
});
