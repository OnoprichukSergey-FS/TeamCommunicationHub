// client/components/ChannelList.tsx
import React from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import type { Channel } from "../types/chat";

type Props = {
  channels: Channel[];
  onSelectChannel: (channel: Channel) => void;
};

export default function ChannelList({ channels, onSelectChannel }: Props) {
  return (
    <View style={styles.container}>
      <FlatList
        data={channels}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable style={styles.item} onPress={() => onSelectChannel(item)}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>
              {item.userCount} online · {item.unreadCount} unread
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  item: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#1f2937",
  },
  name: {
    fontSize: 16,
    color: "#f9fafb",
  },
  meta: {
    fontSize: 12,
    color: "#9ca3af",
  },
});
