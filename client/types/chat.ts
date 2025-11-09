export type ChannelId = "general" | "development" | "random";

export type MessageStatus = "sending" | "sent" | "delivered";

export interface Channel {
  id: ChannelId;
  name: string;
  unreadCount: number;
  userCount: number;
}

export interface User {
  id: string; // logical user id (not socket id)
  name: string;
  status: "online" | "offline";
  lastSeen: string; // ISO date string
}

export interface Message {
  id: string; // uuid or random string
  channelId: ChannelId;
  userId: string;
  userName: string;
  text: string;
  createdAt: string; // ISO date string
  status: MessageStatus;
  edited?: boolean;
  deleted?: boolean;
  reactions?: {
    [emoji: string]: string[]; // emoji -> array of userIds
  };
}

// Default channels we'll use in the app
export const DEFAULT_CHANNELS: Channel[] = [
  { id: "general", name: "General", unreadCount: 0, userCount: 0 },
  { id: "development", name: "Development", unreadCount: 0, userCount: 0 },
  { id: "random", name: "Random", unreadCount: 0, userCount: 0 },
];
