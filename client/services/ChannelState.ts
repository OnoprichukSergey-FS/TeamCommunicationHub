import type { Channel, ChannelId } from "../types/chat";
import { DEFAULT_CHANNELS } from "../types/chat";
import { socketService } from "./SocketService";

type Listener = (channels: Channel[]) => void;

let channels: Channel[] = DEFAULT_CHANNELS.map((c) => ({
  ...c,
  unreadCount: c.unreadCount ?? 0,
  userCount: (c as any).userCount ?? 0,
}));

let activeChannelId: ChannelId | null = null;
const listeners: Listener[] = [];

function notify() {
  listeners.forEach((listener) => listener(channels));
}

export const ChannelState = {
  subscribe(listener: Listener) {
    listeners.push(listener);
    listener(channels);

    return () => {
      const index = listeners.indexOf(listener);
      if (index !== -1) listeners.splice(index, 1);
    };
  },

  getChannels() {
    return channels;
  },

  setActiveChannel(channelId: ChannelId | null) {
    activeChannelId = channelId;

    if (channelId) {
      channels = channels.map((channel) =>
        channel.id === channelId ? { ...channel, unreadCount: 0 } : channel
      );
      notify();
    }
  },

  bumpUnread(channelId: ChannelId) {
    if (activeChannelId === channelId) return;

    channels = channels.map((channel) =>
      channel.id === channelId
        ? { ...channel, unreadCount: (channel.unreadCount ?? 0) + 1 }
        : channel
    );

    notify();
  },

  setUserCount(channelId: ChannelId, count: number) {
    channels = channels.map((channel) =>
      channel.id === channelId ? { ...channel, userCount: count } : channel
    );

    notify();
  },

  setAllUserCounts(counts: Record<string, number>) {
    channels = channels.map((channel) => ({
      ...channel,
      userCount: counts[channel.id] ?? 0,
    }));

    notify();
  },
};

socketService.on("channel:activity", (payload: { channelId: ChannelId }) => {
  ChannelState.bumpUnread(payload.channelId);
});

socketService.on("channel:counts", (counts: Record<string, number>) => {
  ChannelState.setAllUserCounts(counts);
});

socketService.on(
  "presence:update",
  (payload: { channelId: string; users: { id: string; name: string }[] }) => {
    ChannelState.setUserCount(
      payload.channelId as ChannelId,
      payload.users.length
    );
  }
);
