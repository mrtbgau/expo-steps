import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ChecklistCategoryCardProps {
  name: string;
  icon: string;
  completed: number;
  total: number;
  onPress?: () => void;
  onLongPress?: () => void;
}

export default function ChecklistCategoryCard({
  name,
  icon,
  completed,
  total,
  onPress,
  onLongPress,
}: ChecklistCategoryCardProps) {
  const progress = total > 0 ? (completed / total) * 100 : 0;
  const isComplete = total > 0 && completed === total;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons
            name={icon as any}
            size={24}
            color={isComplete ? "#1dd1a1" : "#111518"}
          />
          <Text style={styles.name}>{name}</Text>
        </View>
        <View style={styles.statsContainer}>
          <Text style={[styles.stats, isComplete && styles.statsComplete]}>
            {completed}/{total}
          </Text>
          {isComplete ? (
            <Ionicons name="checkmark-circle" size={20} color="#1dd1a1" />
          ) : (
            <Ionicons name="chevron-forward" size={20} color="#617989" />
          )}
        </View>
      </View>

      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${progress}%`,
              backgroundColor: isComplete ? "#1dd1a1" : "#F6921E",
            },
          ]}
        />
      </View>

      <Text style={styles.progressText}>{Math.round(progress)}%</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111518",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stats: {
    fontSize: 16,
    fontWeight: "600",
    color: "#617989",
  },
  statsComplete: {
    color: "#1dd1a1",
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "#f0f3f4",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "#617989",
    textAlign: "right",
  },
});
