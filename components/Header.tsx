import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  title: string;
  onPress: () => void;
};

export default function Header({ title, onPress }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onPress}>
        <Ionicons name="arrow-back" size={24} color="#111518" />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 8,
    justifyContent: "space-between",
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#111518",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    paddingRight: 48,
    letterSpacing: -0.015,
  },
});
