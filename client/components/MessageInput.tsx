import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet } from "react-native";

type Props = {
  onSend: (text: string) => void;
};

export default function MessageInput({ onSend }: Props) {
  const [text, setText] = useState("");

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Type a message..."
        placeholderTextColor="#6b7280"
        value={text}
        onChangeText={setText}
        style={styles.input}
      />
      <Button title="Send" onPress={handleSend} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#1f2937",
    backgroundColor: "#020617",
  },
  input: {
    flex: 1,
    marginRight: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#374151",
    color: "#f9fafb",
  },
});
