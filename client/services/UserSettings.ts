import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "tch_user_settings";

type StoredShape = {
  name: string;
};

async function getStored(): Promise<StoredShape | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredShape;
  } catch (err) {
    console.log("Error reading user settings", err);
    return null;
  }
}

async function saveStored(data: StoredShape) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.log("Error saving user settings", err);
  }
}

export const UserSettings = {
  async getUserName(): Promise<string> {
    const stored = await getStored();
    return stored?.name || "Guest";
  },

  async setUserName(name: string): Promise<void> {
    const trimmed = name.trim() || "Guest";
    await saveStored({ name: trimmed });
  },
};
