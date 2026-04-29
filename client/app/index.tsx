import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import ChannelList from "../components/ChannelList";
import type { Channel } from "../types/chat";
import { ChannelState } from "../services/ChannelState";

export default function ChannelListScreen() {
  const router = useRouter();
  const [channels, setChannels] = useState<Channel[]>(
    ChannelState.getChannels()
  );

  useEffect(() => {
    const unsubscribe = ChannelState.subscribe((chs) => setChannels(chs));
    return unsubscribe;
  }, []);

  const handleChannelPress = (id: Channel["id"]) => {
    router.push(`/chat/${id}`);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.badge}>Realtime Workspace</Text>
        <Text style={styles.title}>Team Communication Hub</Text>
        <Text style={styles.subtitle}>
          Channels, presence, typing indicators, reactions, and live Socket.io
          messaging.
        </Text>
      </View>

      <View style={styles.listArea}>
        <ChannelList channels={channels} onChannelPress={handleChannelPress} />
      </View>

      <Text style={styles.footer}>
        Built with Expo, React Native, Socket.io, and local message storage.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020617",
    paddingTop: 90,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  header: {
    alignItems: "center",
    marginBottom: 28,
  },

  badge: {
    color: "#8B7CFF",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1.4,
    textAlign: "center",
    marginBottom: 10,
  },

  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "#F8FAFC",
    textAlign: "center",
    marginBottom: 10,
  },

  subtitle: {
    color: "#CBD5E1",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 620,
  },

  listArea: {
    flex: 1,
  },

  footer: {
    color: "#64748B",
    fontSize: 12,
    textAlign: "center",
    marginTop: 16,
  },
});
