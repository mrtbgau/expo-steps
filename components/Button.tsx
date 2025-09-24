import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  label: string;
  onPress: () => void;
  variant: keyof typeof variants;
  color: string;
  disabled?: boolean;
  loading?: boolean;
};

export default function Button({
  label,
  onPress,
  variant,
  color,
  disabled = false,
  loading = false,
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <View style={styles.btnContainer}>
      <Pressable
        style={({ pressed }) => [
          styles.btn,
          variants[variant],
          isDisabled && styles.disabled,
          pressed &&
            !isDisabled &&
            (variant === "btnPrimary"
              ? { backgroundColor: "#10ac84" }
              : variant === "btnDanger"
              ? { backgroundColor: "#c44569" } // Darker red on press
              : { backgroundColor: "#f1f2f6" }),
        ]}
        onPress={isDisabled ? undefined : onPress}
        disabled={isDisabled}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="small"
              color={
                variant === "btnPrimary" || variant === "btnDanger"
                  ? "white"
                  : "#1dd1a1"
              }
            />
            <Text style={[styles.btnLabel, { color }, styles.loadingText]}>
              {label}
            </Text>
          </View>
        ) : (
          <Text
            style={[
              styles.btnLabel,
              { color },
              isDisabled && styles.disabledText,
            ]}
          >
            {label}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  btnContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 320,
  },
  btn: {
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    fontWeight: "600",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    minHeight: 56,
  },
  btnLabel: {
    fontSize: 18,
    fontWeight: "800",
    fontFamily: "Poppins",
  },
  disabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledText: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginLeft: 8,
  },
});

const variants = StyleSheet.create({
  btnPrimary: {
    backgroundColor: "#1dd1a1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 16,
  },
  btnSecondary: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#d1d5db",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  btnDanger: {
    backgroundColor: "#e55039",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 16,
    borderWidth: 0,
  },
});
