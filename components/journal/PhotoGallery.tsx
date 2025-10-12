import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Photo {
  id: number;
  uri: string;
  caption?: string;
}

interface PhotoGalleryProps {
  photos: Photo[];
  onPhotoPress?: (photo: Photo, index: number) => void;
  onRemovePhoto?: (photoId: number) => void;
  editable?: boolean;
}

export default function PhotoGallery({
  photos,
  onPhotoPress,
  onRemovePhoto,
  editable = false,
}: PhotoGalleryProps) {
  if (photos.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {photos.map((photo, index) => (
          <TouchableOpacity
            key={photo.id}
            style={styles.photoContainer}
            onPress={() => onPhotoPress?.(photo, index)}
            activeOpacity={0.8}
          >
            <Image source={{ uri: photo.uri }} style={styles.photo} />
            {photo.caption && (
              <View style={styles.captionContainer}>
                <Text style={styles.caption} numberOfLines={2}>
                  {photo.caption}
                </Text>
              </View>
            )}
            {editable && onRemovePhoto && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => onRemovePhoto(photo.id)}
              >
                <Ionicons name="close-circle" size={24} color="#e55039" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 12,
  },
  photoContainer: {
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f0f3f4",
  },
  photo: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  captionContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 8,
  },
  caption: {
    fontSize: 12,
    color: "#fff",
    lineHeight: 16,
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
});
