import React from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useRouter, Href } from "expo-router";
import { DEFAULT_CHANNELS, type Channel } from "../types/chat";

export default function ChannelListScreen() {
  const router = useRouter();

  const handleChannelPress = (channel: Channel) => {
    router.push(`/chat/${channel.id}` as Href);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Team Communication Hub</Text>

      <FlatList
        data={DEFAULT_CHANNELS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handleChannelPress(item)}
            style={styles.channelItem}
          >
            <Text style={styles.channelName}>{item.name}</Text>
            <Text style={styles.channelMeta}>
              {item.userCount} online · {item.unreadCount} unread
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
    backgroundColor: "#0f172a",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 16,
    color: "#e5e7eb",
  },
  channelItem: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#1f2937",
  },
  channelName: {
    fontSize: 18,
    color: "#f9fafb",
  },
  channelMeta: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
  },
});
