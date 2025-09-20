import React from "react";
import { StyleSheet, TextInput, View } from "react-native";

type Props = {
  placeholder: string;
};

export default function Input({ placeholder }: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
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
});
