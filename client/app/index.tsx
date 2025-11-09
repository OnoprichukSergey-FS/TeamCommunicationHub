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
    <View style={styles.container}>
      <Text style={styles.title}>Team Communication Hub</Text>
      <ChannelList channels={channels} onChannelPress={handleChannelPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    paddingTop: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#e5e7eb",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
});
