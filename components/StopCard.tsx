import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  name: string;
  dates: string;
  location?: string;
  image?: string | null;
  onPress?: () => void;
  onLongPress?: () => void;
};

export default function StopCard({
  name,
  dates,
  location,
  image,
  onPress,
  onLongPress,
}: Props) {
  const [displayLocation, setDisplayLocation] = useState<string | undefined>(
    location
  );

  useEffect(() => {
    if (!location) {
      setDisplayLocation(undefined);
      return;
    }

    const coordPattern = /^-?\d+\.\d+,\s*-?\d+\.\d+$/;
    if (coordPattern.test(location)) {
      const [lat, lon] = location.split(",").map((s) => s.trim());

      fetch(`https://photon.komoot.io/reverse?lon=${lon}&lat=${lat}&lang=fr`)
        .then((response) => response.json())
        .then((data) => {
          if (data.features && data.features.length > 0) {
            const props = data.features[0].properties;
            const city = props.name || props.city;
            const locationParts = [city, props.country].filter(Boolean);
            if (locationParts.length > 0) {
              setDisplayLocation(locationParts.join(", "));
            } else {
              setDisplayLocation(location);
            }
          } else {
            setDisplayLocation(location);
          }
        })
        .catch(() => {
          setDisplayLocation(location);
        });
    } else {
      setDisplayLocation(location);
    }
  }, [location]);

  return (
    <TouchableOpacity
      style={styles.stopCard}
      activeOpacity={0.7}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      {image ? (
        <Image source={{ uri: image }} style={styles.stopImage} />
      ) : (
        <View style={styles.iconContainer}>
          <Ionicons name="location-outline" size={24} color="#1dd1a1" />
        </View>
      )}
      <View style={styles.stopInfo}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.dates}>{dates}</Text>
        {displayLocation && (
          <Text style={styles.location}>{displayLocation}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  stopCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#f0f3f4",
    gap: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: "#e8f8f5",
    justifyContent: "center",
    alignItems: "center",
  },
  stopImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  stopInfo: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111518",
    lineHeight: 20,
  },
  dates: {
    fontSize: 14,
    color: "#617989",
    fontWeight: "400",
    lineHeight: 16,
  },
  location: {
    fontSize: 12,
    color: "#1dd1a1",
    fontWeight: "500",
    lineHeight: 14,
  },
});
