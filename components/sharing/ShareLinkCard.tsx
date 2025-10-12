import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ShareLinkCardProps {
  shareToken: string;
  shareType: string;
  createdAt: string;
  expiresAt?: string | null;
  onRevoke?: () => void;
  onShare?: () => void;
}

export default function ShareLinkCard({
  shareToken,
  shareType,
  createdAt,
  expiresAt,
  onRevoke,
  onShare,
}: ShareLinkCardProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `exposteps://trip/${shareToken}`;
  const formattedDate = new Date(createdAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const isExpired =
    expiresAt && new Date(expiresAt) < new Date();

  const shareTypeLabel =
    shareType === "read-only" ? "Lecture seule" : "Collaborateur";
  const shareTypeColor = shareType === "read-only" ? "#617989" : "#1dd1a1";

  const handleCopy = async () => {
    await Clipboard.setStringAsync(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: `${shareTypeColor}20` }]}>
          <Text style={[styles.badgeText, { color: shareTypeColor }]}>
            {shareTypeLabel}
          </Text>
        </View>
        {isExpired && (
          <View style={styles.expiredBadge}>
            <Text style={styles.expiredText}>Expiré</Text>
          </View>
        )}
      </View>

      <View style={styles.linkContainer}>
        <Text style={styles.linkText} numberOfLines={1}>
          {shareUrl}
        </Text>
      </View>

      <Text style={styles.dateText}>Créé le {formattedDate}</Text>
      {expiresAt && !isExpired && (
        <Text style={styles.expiresText}>
          Expire le{" "}
          {new Date(expiresAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </Text>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleCopy}>
          <Ionicons
            name={copied ? "checkmark-circle" : "copy-outline"}
            size={20}
            color={copied ? "#1dd1a1" : "#617989"}
          />
          <Text style={[styles.actionText, copied && { color: "#1dd1a1" }]}>
            {copied ? "Copié !" : "Copier"}
          </Text>
        </TouchableOpacity>

        {onShare && (
          <TouchableOpacity style={styles.actionButton} onPress={onShare}>
            <Ionicons name="share-outline" size={20} color="#617989" />
            <Text style={styles.actionText}>Partager</Text>
          </TouchableOpacity>
        )}

        {onRevoke && (
          <TouchableOpacity style={styles.actionButton} onPress={onRevoke}>
            <Ionicons name="close-circle-outline" size={20} color="#e55039" />
            <Text style={[styles.actionText, { color: "#e55039" }]}>
              Révoquer
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
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
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  expiredBadge: {
    backgroundColor: "#fee",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  expiredText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#e55039",
  },
  linkContainer: {
    backgroundColor: "#f0f3f4",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  linkText: {
    fontSize: 14,
    color: "#111518",
    fontFamily: "monospace",
  },
  dateText: {
    fontSize: 12,
    color: "#617989",
    marginBottom: 4,
  },
  expiresText: {
    fontSize: 12,
    color: "#F6921E",
  },
  actions: {
    flexDirection: "row",
    marginTop: 12,
    gap: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#617989",
  },
});
