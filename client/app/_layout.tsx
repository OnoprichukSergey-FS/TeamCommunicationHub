import React from "react";
import { Tabs } from "expo-router";

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: "#ffffff",
        },
        headerTitleStyle: {
          fontSize: 16,
          fontWeight: "600",
        },
        tabBarStyle: {
          height: 72,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#8A8A8A",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Channels",
          tabBarLabel: "Channels",
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarLabel: "Settings",
        }}
      />

      <Tabs.Screen
        name="chat/[channel]"
        options={{
          href: null,
          title: "Chat",
        }}
      />
    </Tabs>
  );
}
