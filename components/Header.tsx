import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  title: string;
  onPress?: () => void;
  iconPosition?: "left" | "right";
  icon?: keyof typeof Ionicons.glyphMap;
};

export default function Header({
  title,
  onPress,
  iconPosition = "left",
  icon = "arrow-back",
}: Props) {
  const renderIcon = () => {
    if (!icon || !onPress) return null;

    return (
      <TouchableOpacity style={styles.iconButton} onPress={onPress}>
        <Ionicons name={icon} size={24} color="#111518" />
      </TouchableOpacity>
    );
  };

  const renderLeftContent = () => {
    if (iconPosition === "left") {
      return renderIcon();
    }
    return <View style={styles.spacer} />;
  };

  const renderRightContent = () => {
    if (iconPosition === "right") {
      return renderIcon();
    }
    return <View style={styles.spacer} />;
  };

  return (
    <View style={styles.container}>
      {renderLeftContent()}
      <Text style={styles.title}>{title}</Text>
      {renderRightContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingBottom: 8,
    justifyContent: "space-between",
  },
  iconButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  spacer: {
    width: 48,
    height: 48,
  },
  titleContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#111518",
    fontSize: 18,
    fontWeight: "bold",
  },
});
