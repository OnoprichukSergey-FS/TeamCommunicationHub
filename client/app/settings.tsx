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
import { useRouter } from "expo-router";
import { UserSettings } from "../services/UserSettings";

export default function SettingsScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      const currentName = await UserSettings.getUserName();
      setName(currentName || "Demo");
    };

    load();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      if (Platform.OS === "web") {
        alert("Please enter a name.");
      } else {
        Alert.alert("Invalid name", "Please enter a name.");
      }
      return;
    }

    await UserSettings.setUserName(name.trim());
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  return (
    <View style={styles.screen}>
      <Pressable onPress={() => router.push("/")} style={styles.backButton}>
        <Text style={styles.backText}>← Channels</Text>
      </Pressable>

      <View style={styles.card}>
        <Text style={styles.badge}>User Preferences</Text>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>
          Update the display name used in channels, messages, presence, and
          typing indicators.
        </Text>

        <View style={styles.previewCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(name.trim() || "D").slice(0, 1).toUpperCase()}
            </Text>
          </View>

          <View>
            <Text style={styles.previewName}>{name.trim() || "Demo"}</Text>
            <Text style={styles.previewSubtext}>Visible chat identity</Text>
          </View>
        </View>

        <Text style={styles.label}>Display Name</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          placeholderTextColor="#64748B"
          value={name}
          onChangeText={(value) => {
            setName(value);
            setSaved(false);
          }}
        />

        <Pressable style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Save Settings</Text>
        </Pressable>

        {saved && <Text style={styles.savedText}>Saved successfully ✅</Text>}

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Local App State</Text>
          <Text style={styles.noteText}>
            This setting is stored locally and reused across the chat experience
            so the demo feels like a real workspace profile.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020617",
    paddingTop: 80,
    paddingHorizontal: 20,
    alignItems: "center",
  },

  backButton: {
    position: "absolute",
    top: 54,
    left: 20,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#253149",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },

  backText: {
    color: "#A78BFA",
    fontSize: 13,
    fontWeight: "900",
  },

  card: {
    width: "100%",
    maxWidth: 620,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#253149",
    borderRadius: 28,
    padding: 24,
  },

  badge: {
    color: "#8B7CFF",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1.4,
    marginBottom: 10,
  },

  title: {
    fontSize: 38,
    fontWeight: "900",
    color: "#F8FAFC",
    marginBottom: 8,
  },

  subtitle: {
    color: "#CBD5E1",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 22,
  },

  previewCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0B1220",
    borderWidth: 1,
    borderColor: "#253149",
    borderRadius: 20,
    padding: 16,
    marginBottom: 22,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "rgba(139,124,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(139,124,255,0.35)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  avatarText: {
    color: "#A78BFA",
    fontSize: 22,
    fontWeight: "900",
  },

  previewName: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "900",
  },

  previewSubtext: {
    color: "#94A3B8",
    fontSize: 13,
    marginTop: 3,
  },

  label: {
    color: "#94A3B8",
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  input: {
    backgroundColor: "#0B1220",
    borderColor: "#253149",
    borderWidth: 1,
    borderRadius: 16,
    color: "#F8FAFC",
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 14,
    fontSize: 15,
  },

  button: {
    backgroundColor: "#8B7CFF",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15,
  },

  savedText: {
    color: "#22C55E",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 12,
  },

  noteCard: {
    backgroundColor: "#0B1220",
    borderWidth: 1,
    borderColor: "#253149",
    borderRadius: 18,
    padding: 16,
    marginTop: 18,
  },

  noteTitle: {
    color: "#F8FAFC",
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 6,
  },

  noteText: {
    color: "#CBD5E1",
    fontSize: 13,
    lineHeight: 20,
  },
});
