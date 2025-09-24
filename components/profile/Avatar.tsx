import React from "react";
import { Image, StyleSheet, View } from "react-native";

type Props = {
  userMail: string;
};

export default function Avatar({ userMail }: Props) {
  const avatarStyles = [
    "avataaars-neutral",
    "bottts-neutral",
    "fun-emoji",
    "thumbs",
  ];
  const hashEmail = (email: string): number => {
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      const char = email.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  };
  const generateRandomAvatar = (email: string): string => {
    const hash = hashEmail(email);
    const styleIndex = hash % avatarStyles.length;
    const selectedStyle = avatarStyles[styleIndex];

    return `https://api.dicebear.com/7.x/${selectedStyle}/png?seed=${encodeURIComponent(
      email
    )}&size=128`;
  };

  const avatarUrl = generateRandomAvatar(userMail);

  return (
    <View style={styles.container}>
      <Image source={{ uri: avatarUrl }} style={styles.profileImage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: 128,
    height: 128,
    borderRadius: 64,
    minHeight: 128,
  },
});
