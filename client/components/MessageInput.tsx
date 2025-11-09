import React, { useState, useRef } from "react";
import { View, TextInput, Pressable, Text, StyleSheet } from "react-native";

type Props = {
  onSend: (text: string) => void;
  onTypingChange?: (isTyping: boolean) => void;
};

export default function MessageInput({ onSend, onTypingChange }: Props) {
  const [text, setText] = useState("");
  const typing = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (value: string) => {
    setText(value);

    if (!onTypingChange) return;

    if (!typing.current) {
      typing.current = true;
      onTypingChange(true);
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      typing.current = false;
      onTypingChange(false);
    }, 1500);
  };

  const handleSendPress = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");

    if (onTypingChange && typing.current) {
      typing.current = false;
      onTypingChange(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Type a message..."
        placeholderTextColor="#6b7280"
        value={text}
        onChangeText={handleChange}
      />
      <Pressable style={styles.button} onPress={handleSendPress}>
        <Text style={styles.buttonText}>Send</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#1f2937",
    backgroundColor: "#020617",
  },
  input: {
    flex: 1,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: "#f9fafb",
    marginRight: 8,
  },
  button: {
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
  },
  buttonText: {
    color: "#f9fafb",
    fontWeight: "600",
  },
});
