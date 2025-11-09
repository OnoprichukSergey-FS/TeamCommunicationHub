import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { UserSettings } from "../services/UserSettings";

export default function SettingsScreen() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const currentName = await UserSettings.getUserName();
      setName(currentName);
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Invalid name", "Please enter a name.");
      return;
    }

    await UserSettings.setUserName(name);

    if (Platform.OS === "web") {
      alert("Saved!");
    } else {
      Alert.alert("Saved", "Your name has been updated.");
    }
  };

  if (loading) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <Text style={styles.label}>Display Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        placeholderTextColor="#6b7280"
        value={name}
        onChangeText={setName}
      />

      <Pressable style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#e5e7eb",
    marginBottom: 16,
  },
  label: {
    color: "#9ca3af",
    marginBottom: 4,
    fontSize: 14,
  },
  input: {
    backgroundColor: "#111827",
    borderColor: "#374151",
    borderWidth: 1,
    borderRadius: 6,
    color: "#f9fafb",
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  buttonText: {
    color: "#f9fafb",
    fontWeight: "600",
  },
});
