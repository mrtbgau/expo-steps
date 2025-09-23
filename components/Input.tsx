// import DateTimePicker from "@react-native-community/datetimepicker";
// import React, { useState } from "react";
// import {
//   Platform,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";

// type Props = {
//   placeholder: string;
//   variant: keyof typeof variants;
//   type?: "text" | "date";
//   onDateChange?: (date: Date) => void;
//   value?: string | Date;
// };

// export default function Input({
//   placeholder,
//   variant,
//   type = "text",
//   onDateChange,
//   value,
// }: Props) {
//   const [selectedDate, setSelectedDate] = useState<Date | undefined>(
//     value instanceof Date ? value : undefined
//   );
//   const [showDatePicker, setShowDatePicker] = useState(false);

//   const isMultiline = variant === "textarea";
//   const isDatePicker = type === "date";

//   const handleDateChange = (event: any, date?: Date) => {
//     if (Platform.OS === "android") {
//       setShowDatePicker(false);
//     }

//     if (date) {
//       setSelectedDate(date);
//       onDateChange?.(date);
//     }
//   };

//   const formatDate = (date: Date) => {
//     return date.toLocaleDateString("fr-FR", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//     });
//   };

//   if (isDatePicker) {
//     return (
//       <View style={styles.container}>
//         <TouchableOpacity
//           style={[variants[variant], styles.datePickerButton]}
//           onPress={() => setShowDatePicker(true)}
//         >
//           <Text
//             style={[styles.dateText, !selectedDate && styles.placeholderText]}
//           >
//             {selectedDate ? formatDate(selectedDate) : placeholder}
//           </Text>
//         </TouchableOpacity>

//         {showDatePicker && (
//           <DateTimePicker
//             value={selectedDate || new Date()}
//             mode="date"
//             display={Platform.OS === "ios" ? "spinner" : "default"}
//             onChange={handleDateChange}
//           />
//         )}
//       </View>
//     );
//   }
//   return (
//     <View style={styles.container}>
//       <TextInput
//         style={variants[variant]}
//         placeholder={placeholder}
//         placeholderTextColor="#617989"
//         multiline={isMultiline}
//         numberOfLines={isMultiline ? 6 : 1}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     width: "100%",
//     alignItems: "center",
//   },
//   datePickerButton: {
//     justifyContent: "center",
//   },
//   dateText: {
//     fontSize: 16,
//     color: "#111518",
//   },
//   placeholderText: {
//     color: "#617989",
//   },
// });

// const variants = StyleSheet.create({
//   input: {
//     width: "100%",
//     maxWidth: 320,
//     height: 56,
//     backgroundColor: "#f0f3f4",
//     borderRadius: 12,
//     paddingHorizontal: 16,
//     fontSize: 16,
//     color: "#111518",
//   },
//   textarea: {
//     width: "100%",
//     maxWidth: 320,
//     minHeight: 144,
//     backgroundColor: "#f0f3f4",
//     borderRadius: 12,
//     padding: 16,
//     fontSize: 16,
//     color: "#111518",
//     textAlignVertical: "top",
//   },
// });
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  placeholder: string;
  variant: keyof typeof variants;
  type?: "text" | "date";
  onDateChange?: (date: Date) => void;
  value?: string | Date;
};

export default function Input({
  placeholder,
  variant,
  type = "text",
  onDateChange,
  value,
}: Props) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    value instanceof Date ? value : undefined
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const isMultiline = variant === "textarea";
  const isDatePicker = type === "date";

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (date) {
      setSelectedDate(date);
      onDateChange?.(date);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (isDatePicker) {
    return (
      <View style={styles.container}>
        <View style={[variants[variant], styles.dateInputContainer]}>
          <Text
            style={[styles.dateText, !selectedDate && styles.placeholderText]}
          >
            {selectedDate ? formatDate(selectedDate) : placeholder}
          </Text>
          <TouchableOpacity
            style={styles.calendarIconContainer}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#617989" />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleDateChange}
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={variants[variant]}
        placeholder={placeholder}
        placeholderTextColor="#617989"
        multiline={isMultiline}
        numberOfLines={isMultiline ? 6 : 1}
        value={typeof value === "string" ? value : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  dateInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateText: {
    fontSize: 16,
    color: "#111518",
    flex: 1,
  },
  placeholderText: {
    color: "#617989",
  },
  calendarIconContainer: {
    padding: 4,
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
