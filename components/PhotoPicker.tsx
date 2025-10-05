import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ImagePickerComponentProps {
  onImageSelected?: (imageUri: string) => void;
  initialImage?: string | null;
}

export default function PhotoPicker({
  onImageSelected,
  initialImage,
}: ImagePickerComponentProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(
    initialImage || null
  );

  useEffect(() => {
    setSelectedImage(initialImage || null);
  }, [initialImage]);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission requise",
        "Nous avons besoin d'accéder à vos photos pour sélectionner une image."
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      setSelectedImage(imageUri);
      onImageSelected?.(imageUri);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    onImageSelected?.("");
  };

  return (
    <View style={styles.container}>
      {selectedImage ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
          <TouchableOpacity style={styles.removeButton} onPress={removeImage}>
            <Ionicons name="close-circle" size={24} color="#ff4757" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.placeholderContainer}
          onPress={pickImage}
        >
          <Ionicons name="camera-outline" size={32} color="#617989" />
          <Text style={styles.placeholderText}>Ajouter une photo</Text>
          <Text style={styles.subtitleText}>
            Touchez pour sélectionner depuis votre galerie
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 320,
  },
  placeholderContainer: {
    width: "100%",
    height: 120,
    backgroundColor: "#f0f3f4",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e8ea",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#617989",
  },
  subtitleText: {
    fontSize: 12,
    color: "#9aa5b1",
    textAlign: "center",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 120,
  },
  selectedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    resizeMode: "cover",
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "white",
    borderRadius: 12,
  },
});
