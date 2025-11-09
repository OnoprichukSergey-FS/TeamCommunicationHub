import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ChannelId, Message } from "../types/chat";

const STORAGE_KEY = "teamCommMessagesNative";

type MessageMap = Record<string, Message[]>;
async function loadAll(): Promise<MessageMap> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed to load messages from AsyncStorage", e);
    return {};
  }
}

async function saveAll(map: MessageMap) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn("Failed to save messages to AsyncStorage", e);
  }
}

export const MessageStorage = {
  init() {},

  async getMessagesByChannel(channelId: ChannelId): Promise<Message[]> {
    const map = await loadAll();
    return map[channelId] || [];
  },

  async saveMessage(message: Message) {
    const map = await loadAll();
    const list = map[message.channelId] || [];
    const index = list.findIndex((m) => m.id === message.id);

    if (index !== -1) {
      list[index] = message;
    } else {
      list.push(message);
    }

    map[message.channelId] = list;
    await saveAll(map);
  },
};
