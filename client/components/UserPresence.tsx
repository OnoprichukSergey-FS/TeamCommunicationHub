import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { User } from "../types/chat";

type Props = {
  users: User[];
};

function formatLastSeen(lastSeen: string | null) {
  if (!lastSeen) return "";
  const date = new Date(lastSeen);
  return date.toLocaleTimeString();
}

export default function UserPresence({ users }: Props) {
  if (!users.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>No one else is here yet.</Text>
      </View>
    );
  }

  const online = users.filter((u) => u.status === "online");
  const offline = users.filter((u) => u.status === "offline");

  return (
    <View style={styles.container}>
      <Text style={styles.label}>People in this channel</Text>

      {online.map((user) => (
        <View key={user.id} style={styles.row}>
          <View style={[styles.dot, { backgroundColor: "#22c55e" }]} />
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.status}>online</Text>
        </View>
      ))}

      {offline.map((user) => (
        <View key={user.id} style={styles.row}>
          <View style={[styles.dot, { backgroundColor: "#6b7280" }]} />
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.status}>
            last seen {formatLastSeen(user.lastSeen)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#1f2937",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  label: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  name: {
    fontSize: 13,
    color: "#e5e7eb",
    marginRight: 6,
  },
  status: {
    fontSize: 11,
    color: "#9ca3af",
  },
});
