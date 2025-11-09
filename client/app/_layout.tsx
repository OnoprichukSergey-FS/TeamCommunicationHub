import React, { useEffect } from "react";
import { Tabs } from "expo-router";
import { MessageStorage } from "../services/MessageStorage";

export default function RootLayout() {
  useEffect(() => {
    MessageStorage.init();
  }, []);

  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "Channels",
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
        }}
      />
    </Tabs>
  );
}
