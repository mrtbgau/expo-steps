import { Feather, FontAwesome } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#1dd1a1",
        tabBarInactiveTintColor: "#617989",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          letterSpacing: 0.015,
        },
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#f0f3f4",
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 12,
          paddingHorizontal: 16,
          height: 65,
        },
      }}
    >
      <Tabs.Screen
        name="trips"
        options={{
          title: "Mes voyages",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="suitcase" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Carte",
          tabBarIcon: ({ color }) => (
            <Feather name="map" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
