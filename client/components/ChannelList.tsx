import React from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ListRenderItem,
} from "react-native";
import type { Channel, ChannelId } from "../types/chat";

type Props = {
  channels: Channel[];
  onChannelPress: (channelId: ChannelId) => void;
};

export default function ChannelList({ channels, onChannelPress }: Props) {
  const renderItem: ListRenderItem<Channel> = ({ item }) => {
    return (
      <Pressable
        style={styles.row}
        onPress={() => onChannelPress(item.id)}
        android_ripple={{ color: "#111827" }}
      >
        <View style={styles.rowContent}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.meta}>
            {item.userCount} online • {item.unreadCount} unread
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <FlatList
      data={channels}
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
  row: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#1f2937",
  },
  rowContent: {
    flexDirection: "column",
  },
  name: {
    fontSize: 16,
    color: "#e5e7eb",
    marginBottom: 2,
  },
  meta: {
    fontSize: 12,
    color: "#9ca3af",
  },
});
