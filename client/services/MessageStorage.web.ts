// client/services/MessageStorage.web.ts
import type { ChannelId, Message } from "../types/chat";

const STORAGE_KEY = "teamCommMessages";

type MessageMap = Record<string, Message[]>; // channelId -> messages[]

function loadAll(): MessageMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed to load messages from localStorage", e);
    return {};
  }
}

function saveAll(map: MessageMap) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn("Failed to save messages to localStorage", e);
  }
}

export const MessageStorage = {
  init() {
    // nothing needed on web
  },

  async getMessagesByChannel(channelId: ChannelId): Promise<Message[]> {
    const map = loadAll();
    return map[channelId] || [];
  },

  saveMessage(message: Message) {
    const map = loadAll();
    const list = map[message.channelId] || [];
    const index = list.findIndex((m) => m.id === message.id);

    if (index !== -1) {
      list[index] = message;
    } else {
      list.push(message);
    }

    map[message.channelId] = list;
    saveAll(map);
  },
};
