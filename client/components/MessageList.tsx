import React from "react";
import { FlatList, View, Text, StyleSheet } from "react-native";
import type { Message } from "../types/chat";

type Props = {
  messages: Message[];
};

export default function MessageList({ messages }: Props) {
  return (
    <FlatList
      data={messages}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={styles.messageRow}>
          <Text style={styles.userName}>{item.userName}</Text>
          <Text style={styles.text}>
            {item.deleted ? "This message was deleted" : item.text}
            {item.edited && !item.deleted ? " (edited)" : ""}
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 12,
  },
  messageRow: {
    marginBottom: 8,
  },
  userName: {
    fontSize: 12,
    color: "#9ca3af",
  },
  text: {
    fontSize: 16,
    color: "#f9fafb",
  },
});
