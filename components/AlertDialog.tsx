import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger";
};

export default function AlertDialog({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  variant = "default",
}: Props) {
  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <View style={styles.container}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.dialog}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>

              <View style={styles.buttonContainer}>
                {onCancel && (
                  <Pressable
                    style={({ pressed }) => [
                      styles.button,
                      styles.cancelButton,
                      pressed && styles.cancelButtonPressed,
                    ]}
                    onPress={handleCancel}
                  >
                    <Text style={styles.cancelButtonText}>{cancelText}</Text>
                  </Pressable>
                )}

                <Pressable
                  style={({ pressed }) => [
                    styles.button,
                    variant === "danger"
                      ? styles.dangerButton
                      : styles.confirmButton,
                    pressed &&
                      (variant === "danger"
                        ? styles.dangerButtonPressed
                        : styles.confirmButtonPressed),
                  ]}
                  onPress={handleConfirm}
                >
                  <Text
                    style={
                      variant === "danger"
                        ? styles.dangerButtonText
                        : styles.confirmButtonText
                    }
                  >
                    {confirmText}
                  </Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  dialog: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    fontFamily: "Poppins",
    color: "#2d3436",
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    fontFamily: "Poppins",
    color: "#636e72",
    marginBottom: 24,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  cancelButtonPressed: {
    backgroundColor: "#f1f2f6",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Poppins",
    color: "#636e72",
  },
  confirmButton: {
    backgroundColor: "#1dd1a1",
  },
  confirmButtonPressed: {
    backgroundColor: "#10ac84",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Poppins",
    color: "white",
  },
  dangerButton: {
    backgroundColor: "#e55039",
  },
  dangerButtonPressed: {
    backgroundColor: "#c44569",
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Poppins",
    color: "white",
  },
});
