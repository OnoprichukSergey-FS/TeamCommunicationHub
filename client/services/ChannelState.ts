import type { Channel, ChannelId } from "../types/chat";
import { DEFAULT_CHANNELS } from "../types/chat";
import { socketService } from "./SocketService";

type Listener = (channels: Channel[]) => void;

let channels: Channel[] = DEFAULT_CHANNELS.map((c) => ({ ...c }));
let activeChannelId: ChannelId | null = null;
const listeners: Listener[] = [];

function notify() {
  listeners.forEach((l) => l(channels));
}

export const ChannelState = {
  subscribe(listener: Listener) {
    listeners.push(listener);
    // send current state immediately
    listener(channels);
    return () => {
      const idx = listeners.indexOf(listener);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  },

  getChannels() {
    return channels;
  },

  setActiveChannel(channelId: ChannelId | null) {
    activeChannelId = channelId;
    if (channelId) {
      // when viewing a channel, clear its unread
      channels = channels.map((ch) =>
        ch.id === channelId ? { ...ch, unreadCount: 0 } : ch
      );
      notify();
    }
  },

  bumpUnread(channelId: ChannelId) {
    // don't count unread for the channel we're currently looking at
    if (activeChannelId === channelId) return;
    channels = channels.map((ch) =>
      ch.id === channelId ? { ...ch, unreadCount: ch.unreadCount + 1 } : ch
    );
    notify();
  },

  setUserCount(channelId: ChannelId, count: number) {
    channels = channels.map((ch) =>
      ch.id === channelId ? { ...ch, userCount: count } : ch
    );
    notify();
  },
};

//  Wire socket events once, at module load

socketService.on("channel:activity", (payload: { channelId: ChannelId }) => {
  ChannelState.bumpUnread(payload.channelId);
});

// optional: keep userCount in sync using presence updates
socketService.on(
  "presence:update",
  (payload: { channelId: string; users: { id: string; name: string }[] }) => {
    ChannelState.setUserCount(
      payload.channelId as ChannelId,
      payload.users.length
    );
  }
);
