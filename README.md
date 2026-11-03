
# Team Communication Hub

A cross-platform real-time messaging application built with React Native, Expo, TypeScript, Node.js, Express, and Socket.IO.

Developed as a Full Sail University project, Team Communication Hub explores real-time communication, multi-channel messaging, user presence, and local message persistence across web and mobile platforms.

## Features

- Real-time messaging using Socket.IO
- Three chat channels: General, Development, and Random
- Typing indicators
- Online user presence
- Unread message indicators
- Emoji reactions
- Editable display name
- Local message persistence
- Dark-themed interface
- Cross-platform client architecture

## Tech Stack

### Frontend
- React Native
- Expo
- Expo Router
- TypeScript
- Socket.IO Client
- AsyncStorage (native)
- Browser localStorage (web)

### Backend
- Node.js
- Express
- Socket.IO
- In-memory message storage

## Project Structure

```text
TeamCommunicationHub/
  client/
    app/
      chat/
      index.tsx
      settings.tsx
    components/
      ChannelList.tsx
      MessageInput.tsx
      MessageList.tsx
      TypingIndicator.tsx
      UserPresence.tsx
    services/
      ChannelState.ts
      MessageStorage.native.ts
      MessageStorage.web.ts
      SocketService.ts
      UserSettings.ts
    types/
      chat.ts

  server/
    index.js

  demo/
    demo-video.mp4
    screenshots/
```

## How It Works

### Real-Time Messaging

The client connects to a Node.js and Express server using Socket.IO.

When a user joins a channel, the server manages channel membership and sends available message history.

Messages and other real-time events are exchanged through Socket.IO.

### Channels and User Presence

The application supports three channels:

- General
- Development
- Random

The server tracks connected users and broadcasts updates when users join or leave channels.

Typing indicators allow users to see when someone is composing a message.

### Local Message Persistence

The application uses platform-specific storage implementations:

- Web: browser localStorage
- Native: AsyncStorage

Messages are saved locally to preserve chat history on the device.

The server currently stores messages in memory rather than using a persistent database.

### User Interface

The client uses reusable components for channel navigation, message lists, message input, typing indicators, and user presence.

Expo Router manages navigation between the chat interface and settings.

## Installation and Setup

### Requirements

- Node.js
- npm
- Expo-compatible development environment

### Clone the Repository

```bash
git clone https://github.com/OnoprichukSergey-FS/TeamCommunicationHub.git
cd TeamCommunicationHub
```

### Start the Backend

Open a terminal:

```bash
cd server
npm install
npm run dev
```

### Start the Frontend

Open another terminal from the project root:

```bash
cd client
npm install
npm start
```

### Run on Web

From the client directory:

```bash
npm run web
```

### Run on Mobile

Use an appropriate Expo-compatible device or development environment.

**Note:** The client currently contains a configured Socket.IO server URL in `client/services/SocketService.ts`. To connect to a locally running backend, update that URL to the appropriate local network address.

## Technical Concepts Demonstrated

- Real-time event-driven communication
- WebSocket-based messaging through Socket.IO
- Client-server architecture
- React component organization
- TypeScript
- Channel membership management
- User presence and typing indicators
- Platform-specific local storage
- State management
- Reusable UI components

## Current Limitations

- Server message history is stored in memory
- Server restarts can clear server-side message history
- Local message storage is device-specific
- The project does not include production user authentication
- Additional validation, testing, and persistent backend storage would be needed for production use

## Future Improvements

- Persistent backend database
- User authentication and authorization
- Improved message synchronization
- Automated testing
- Push notifications
- File attachments
- Improved reconnection handling

## Demo

A demonstration video and screenshots are available in the `demo/` directory.

## Author

**Sergey Onoprichuk**

Web Development Graduate | Cybersecurity Student

[GitHub Profile](https://github.com/OnoprichukSergey-FS)
