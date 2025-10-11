import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  title: string;
  duration: string;
  dates: string;
  image: string;
  onPress?: () => void;
  onLongPress?: () => void;
};

export default function Trip({
  title,
  duration,
  dates,
  image,
  onPress,
  onLongPress,
}: Props) {
  return (
    <TouchableOpacity
      style={styles.tripCard}
      activeOpacity={0.7}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={styles.tripInfo}>
        <Text style={styles.duration}>{duration}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.dates}>{dates}</Text>
      </View>
      <Image source={{ uri: image }} style={styles.tripImage} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tripCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "stretch",
    marginHorizontal: 16,
    marginVertical: 8,
    gap: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 4,
  },
  tripInfo: {
    flex: 2,
    justifyContent: "center",
    gap: 4,
    paddingLeft: 4,
  },
  duration: {
    fontSize: 14,
    color: "#617989",
    fontWeight: "400",
    lineHeight: 16,
  },
  title: {
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
  tripImage: {
    flex: 1,
    aspectRatio: 16 / 9,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
  },
});
