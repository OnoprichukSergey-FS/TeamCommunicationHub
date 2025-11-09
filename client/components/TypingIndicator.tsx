import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = {
  names: string[];
};

export default function TypingIndicator({ names }: Props) {
  if (!names.length) return null;

  const label =
    names.length === 1
      ? `${names[0]} is typing...`
      : `${names.join(", ")} are typing...`;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  text: {
    fontSize: 12,
    color: "#9ca3af",
    fontStyle: "italic",
  },
});
