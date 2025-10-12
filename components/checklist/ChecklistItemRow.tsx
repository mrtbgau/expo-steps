import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ChecklistItemRowProps {
  name: string;
  isChecked: boolean;
  onToggle?: () => void;
  onLongPress?: () => void;
}

export default function ChecklistItemRow({
  name,
  isChecked,
  onToggle,
  onLongPress,
}: ChecklistItemRowProps) {
  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle?.();
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleToggle}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.checkbox}>
        {isChecked ? (
          <Ionicons name="checkmark-circle" size={24} color="#1dd1a1" />
        ) : (
          <Ionicons name="ellipse-outline" size={24} color="#d1d5db" />
        )}
      </View>
      <Text
        style={[
          styles.name,
          isChecked && styles.nameChecked,
        ]}
      >
        {name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f3f4",
  },
  checkbox: {
    marginRight: 12,
  },
  name: {
    flex: 1,
    fontSize: 16,
    color: "#111518",
  },
  nameChecked: {
    color: "#9ca3af",
    textDecorationLine: "line-through",
  },
});
