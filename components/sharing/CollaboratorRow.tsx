import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CollaboratorRowProps {
  email: string;
  role: string;
  status: string;
  invitedAt: string;
  onLongPress?: () => void;
}

export default function CollaboratorRow({
  email,
  role,
  status,
  invitedAt,
  onLongPress,
}: CollaboratorRowProps) {
  const formattedDate = new Date(invitedAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });

  const getRoleLabel = () => {
    switch (role) {
      case "owner":
        return "Propriétaire";
      case "editor":
        return "Éditeur";
      case "viewer":
        return "Observateur";
      default:
        return role;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "accepted":
        return "#1dd1a1";
      case "declined":
        return "#e55039";
      case "pending":
        return "#F6921E";
      default:
        return "#617989";
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case "accepted":
        return "Accepté";
      case "declined":
        return "Refusé";
      case "pending":
        return "En attente";
      default:
        return status;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "accepted":
        return "checkmark-circle";
      case "declined":
        return "close-circle";
      case "pending":
        return "time";
      default:
        return "help-circle";
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={20} color="#617989" />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.email}>{email}</Text>
        <View style={styles.metadata}>
          <View style={styles.roleContainer}>
            <Ionicons name="shield-checkmark-outline" size={14} color="#617989" />
            <Text style={styles.roleText}>{getRoleLabel()}</Text>
          </View>
          <Text style={styles.separator}>•</Text>
          <Text style={styles.dateText}>Invité {formattedDate}</Text>
        </View>
      </View>

      <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor()}20` }]}>
        <Ionicons
          name={getStatusIcon() as any}
          size={14}
          color={getStatusColor()}
        />
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusLabel()}
        </Text>
      </View>
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
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f3f4",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  email: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111518",
    marginBottom: 4,
  },
  metadata: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  roleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  roleText: {
    fontSize: 12,
    color: "#617989",
  },
  separator: {
    fontSize: 12,
    color: "#d1d5db",
  },
  dateText: {
    fontSize: 12,
    color: "#617989",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
