import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface JournalFilterProps {
  viewMode: "date" | "stop";
  onViewModeChange: (mode: "date" | "stop") => void;
  stopName?: string;
  onClearStopFilter?: () => void;
}

export default function JournalFilter({
  viewMode,
  onViewModeChange,
  stopName,
  onClearStopFilter,
}: JournalFilterProps) {
  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggle, viewMode === "date" && styles.activeToggle]}
          onPress={() => onViewModeChange("date")}
        >
          <Ionicons
            name="calendar-outline"
            size={18}
            color={viewMode === "date" ? "#1dd1a1" : "#617989"}
          />
          <Text
            style={[styles.toggleText, viewMode === "date" && styles.activeText]}
          >
            Par date
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggle, viewMode === "stop" && styles.activeToggle]}
          onPress={() => onViewModeChange("stop")}
        >
          <Ionicons
            name="location-outline"
            size={18}
            color={viewMode === "stop" ? "#1dd1a1" : "#617989"}
          />
          <Text
            style={[styles.toggleText, viewMode === "stop" && styles.activeText]}
          >
            Par étape
          </Text>
        </TouchableOpacity>
      </View>

      {viewMode === "stop" && stopName && (
        <View style={styles.filterInfo}>
          <Ionicons name="filter" size={16} color="#617989" />
          <Text style={styles.filterText}>Étape: {stopName}</Text>
          {onClearStopFilter && (
            <TouchableOpacity onPress={onClearStopFilter}>
              <Ionicons name="close-circle" size={20} color="#617989" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f3f4",
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#f0f3f4",
    borderRadius: 8,
    padding: 4,
  },
  toggle: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 6,
  },
  activeToggle: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#617989",
  },
  activeText: {
    color: "#1dd1a1",
  },
  filterInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f0f3f4",
    borderRadius: 8,
    gap: 8,
  },
  filterText: {
    flex: 1,
    fontSize: 14,
    color: "#617989",
  },
});
