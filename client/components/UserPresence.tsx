import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { User } from "../types/chat";

type Props = {
  users: User[];
};

export default function UserPresence({ users }: Props) {
  if (!users.length) return null;

  const online = users.filter((u) => u.status === "online");
  const offline = users.filter((u) => u.status === "offline");

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Online</Text>
      {online.length === 0 && (
        <Text style={styles.empty}>No one online right now.</Text>
      )}
      {online.map((u) => (
        <Text key={u.id} style={styles.onlineUser}>
          ● {u.name}
        </Text>
      ))}

      {offline.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Offline</Text>
          {offline.map((u) => (
            <Text key={u.id} style={styles.offlineUser}>
              ◯ {u.name}
            </Text>
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9ca3af",
  },
  empty: {
    fontSize: 12,
    color: "#6b7280",
  },
  onlineUser: {
    fontSize: 12,
    color: "#22c55e",
  },
  offlineUser: {
    fontSize: 12,
    color: "#6b7280",
  },
});
