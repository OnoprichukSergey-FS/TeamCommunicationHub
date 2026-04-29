import React from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import type { Channel } from "../types/chat";

type Props = {
  channels: Channel[];
  onChannelPress: (id: Channel["id"]) => void;
};

function getOnlineCount(channel: Channel) {
  const safeChannel = channel as any;

  return (
    safeChannel.userCount ??
    safeChannel.onlineUsers ??
    safeChannel.onlineCount ??
    0
  );
}

function getUnreadCount(channel: Channel) {
  const safeChannel = channel as any;
  return safeChannel.unreadCount ?? 0;
}

export default function ChannelList({ channels, onChannelPress }: Props) {
  return (
    <FlatList
      data={channels}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        const onlineCount = getOnlineCount(item);
        const unreadCount = getUnreadCount(item);

        return (
          <Pressable
            onPress={() => onChannelPress(item.id)}
            style={({ pressed }) => [
              styles.channelItem,
              pressed && styles.channelPressed,
            ]}
          >
            <View style={styles.iconBox}>
              <Text style={styles.iconText}>#</Text>
            </View>

            <View style={styles.channelInfo}>
              <Text style={styles.channelName}>{item.name}</Text>

              <Text style={styles.metaText}>
                {onlineCount} online • {unreadCount} unread
              </Text>
            </View>

            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{unreadCount}</Text>
              </View>
            )}
          </Pressable>
        );
      }}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 20,
  },

  channelItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#253149",
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
  },

  channelPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(139,124,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(139,124,255,0.35)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  iconText: {
    color: "#A78BFA",
    fontSize: 22,
    fontWeight: "900",
  },

  channelInfo: {
    flex: 1,
  },

  channelName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#F8FAFC",
    marginBottom: 4,
  },

  metaText: {
    fontSize: 13,
    color: "#94A3B8",
  },

  unreadBadge: {
    backgroundColor: "#8B7CFF",
    borderRadius: 999,
    minWidth: 26,
    height: 26,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },

  unreadText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  separator: {
    height: 12,
  },
});
