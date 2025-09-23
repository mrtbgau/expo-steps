import React from "react";
import { StyleSheet, TextInput, View } from "react-native";

type Props = {
  placeholder: string;
  variant: keyof typeof variants;
};

export default function Input({ placeholder, variant }: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        style={variants[variant]}
        placeholder={placeholder}
        placeholderTextColor="#617989"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
});

const variants = StyleSheet.create({
  input: {
    width: "100%",
    maxWidth: 320,
    height: 56,
    backgroundColor: "#f0f3f4",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#111518",
  },
  textarea: {
    width: "100%",
    maxWidth: 320,
    minHeight: 144,
    backgroundColor: "#f0f3f4",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#111518",
    textAlignVertical: "top",
  },
});
