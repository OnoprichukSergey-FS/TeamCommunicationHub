import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = {
  names: string[];
};

export default function TypingIndicator({ names }: Props) {
  if (!names.length) return null;

  let text: string;
  if (names.length === 1) {
    text = `${names[0]} is typing…`;
  } else if (names.length === 2) {
    text = `${names[0]} and ${names[1]} are typing…`;
  } else {
    text = `${names[0]} and ${names.length - 1} others are typing…`;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  text: {
    fontSize: 12,
    color: "#9ca3af",
  },
});
