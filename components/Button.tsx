// import { Pressable, StyleSheet, Text, View } from "react-native";

// type Props = {
//   label: string;
//   onPress: () => void;
//   variant: keyof typeof variants;
//   color: string;
// };

// export default function Button({ label, onPress, variant, color }: Props) {
//   return (
//     <View style={styles.btnContainer}>
//       <Pressable
//         style={({ pressed }) => [
//           styles.btn,
//           variants[variant],
//           pressed &&
//             (variant === "btnPrimary"
//               ? { backgroundColor: "#10ac84" }
//               : { backgroundColor: "#f1f2f6" }),
//         ]}
//         onPress={onPress}
//       >
//         <Text style={[styles.btnLabel, { color }]}>{label}</Text>
//       </Pressable>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   btnContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//     width: 320,
//   },
//   btn: {
//     width: "100%",
//     paddingVertical: 16,
//     paddingHorizontal: 24,
//     borderRadius: 12,
//     fontWeight: "600",
//     alignItems: "center",
//     justifyContent: "center",
//     shadowColor: "#000",
//   },
//   btnLabel: {
//     fontSize: 18,
//     fontWeight: "800",
//     fontFamily: "Poppins",
//   },
// });

// const variants = StyleSheet.create({
//   btnPrimary: {
//     backgroundColor: "#1dd1a1",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 6,
//     elevation: 5,
//     marginBottom: 16,
//   },
//   btnSecondary: {
//     backgroundColor: "white",
//     borderWidth: 1,
//     borderColor: "#d1d5db",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
// });
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
  disabled?: boolean; // Added
  loading?: boolean; // Added
};

export default function Button({
  label,
  onPress,
  variant,
  color,
  disabled = false, // Added with default
  loading = false, // Added with default
}: Props) {
  const isDisabled = disabled || loading; // Added logic

  return (
    <View style={styles.btnContainer}>
      <Pressable
        style={({ pressed }) => [
          styles.btn,
          variants[variant],
          isDisabled && styles.disabled, // Added disabled style
          pressed &&
            !isDisabled && // Modified: don't show pressed state when disabled
            (variant === "btnPrimary"
              ? { backgroundColor: "#10ac84" }
              : { backgroundColor: "#f1f2f6" }),
        ]}
        onPress={isDisabled ? undefined : onPress} // Modified: disable onPress when disabled
        disabled={isDisabled} // Added disabled prop
      >
        {loading ? ( // Added loading state
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="small"
              color={variant === "btnPrimary" ? "white" : "#1dd1a1"}
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
    minHeight: 56, // Added for consistency during loading
  },
  btnLabel: {
    fontSize: 18,
    fontWeight: "800",
    fontFamily: "Poppins",
  },
  // Added new styles below:
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
});
