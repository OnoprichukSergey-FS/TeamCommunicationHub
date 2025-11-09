import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { socketService } from "../services/SocketService";

export default function HomeScreen() {
  useEffect(() => {
    socketService.connect();
    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Team Communication Hub</Text>
      <Text>Check your terminal for Socket.io logs.</Text>
    </View>
  );
}
