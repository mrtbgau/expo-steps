import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

type BaseTextareaProps = Omit<TextInputProps, "value" | "onChangeText" | "multiline" | "numberOfLines">;

type Props = BaseTextareaProps & {
  placeholder: string;
  value?: string;
  error?: string;
  onChangeText?: (text: string) => void;
};

export default function Textarea({
  placeholder,
  value = "",
  error,
  onChangeText,
  ...textInputProps
}: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.textarea,
          error && styles.errorBorder,
        ]}
        placeholder={placeholder}
        placeholderTextColor="#617989"
        multiline={true}
        numberOfLines={6}
        value={value}
        onChangeText={onChangeText}
        textAlignVertical="top"
        {...textInputProps}
      />

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={16} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
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
  errorBorder: {
    borderWidth: 1,
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 4,
    maxWidth: 320,
    width: "100%",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
    marginLeft: 4,
    flex: 1,
  },
});