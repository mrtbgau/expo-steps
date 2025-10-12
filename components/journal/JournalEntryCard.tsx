import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface JournalEntryCardProps {
  title: string;
  date: string;
  content?: string;
  thumbnailUri?: string;
  photoCount?: number;
  hasAudio?: boolean;
  stopName?: string;
  onPress?: () => void;
  onLongPress?: () => void;
}

export default function JournalEntryCard({
  title,
  date,
  content,
  thumbnailUri,
  photoCount = 0,
  hasAudio = false,
  stopName,
  onPress,
  onLongPress,
}: JournalEntryCardProps) {
  const formattedDate = new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      {thumbnailUri && (
        <Image source={{ uri: thumbnailUri }} style={styles.thumbnail} />
      )}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>

        {stopName && (
          <View style={styles.stopContainer}>
            <Ionicons name="location" size={14} color="#617989" />
            <Text style={styles.stopName}>{stopName}</Text>
          </View>
        )}

        {content && (
          <Text style={styles.excerpt} numberOfLines={2}>
            {content}
          </Text>
        )}

        <View style={styles.footer}>
          {photoCount > 0 && (
            <View style={styles.badge}>
              <Ionicons name="images-outline" size={16} color="#617989" />
              <Text style={styles.badgeText}>{photoCount}</Text>
            </View>
          )}
          {hasAudio && (
            <View style={styles.badge}>
              <Ionicons name="mic-outline" size={16} color="#617989" />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnail: {
    width: "100%",
    height: 160,
    backgroundColor: "#f0f3f4",
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111518",
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: "#617989",
  },
  stopContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 4,
  },
  stopName: {
    fontSize: 14,
    color: "#617989",
    fontStyle: "italic",
  },
  excerpt: {
    fontSize: 14,
    color: "#111518",
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  badgeText: {
    fontSize: 14,
    color: "#617989",
  },
});
