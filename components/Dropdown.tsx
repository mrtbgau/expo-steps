import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export interface DropdownOption {
  id: string | number;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

interface DropdownProps {
  value: string | number;
  options: DropdownOption[];
  onChange: (value: string | number) => void;
  placeholder?: string;
  style?: object;
}

export default function Dropdown({
  value,
  options,
  onChange,
  placeholder = "Select an option",
  style,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.id === value);

  const handleSelect = (optionValue: string | number) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <View style={[styles.container, style]}>
      <Pressable
        style={styles.button}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={styles.buttonText}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={20}
          color="#222f3e"
        />
      </Pressable>

      {isOpen && (
        <ScrollView style={styles.dropdownContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.dropdownItem,
                value === option.id && styles.dropdownItemSelected,
              ]}
              onPress={() => handleSelect(option.id)}
            >
              {option.icon && (
                <Ionicons
                  name={option.icon}
                  size={20}
                  color={value === option.id ? "#1dd1a1" : "#617989"}
                />
              )}
              <Text
                style={[
                  styles.dropdownItemText,
                  value === option.id && styles.dropdownItemTextSelected,
                  option.icon && { marginLeft: 12 },
                ]}
              >
                {option.label}
              </Text>
              {value === option.id && (
                <Ionicons name="checkmark" size={20} color="#1dd1a1" />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  button: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222f3e",
    flex: 1,
  },
  dropdownContainer: {
    marginTop: 8,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    maxHeight: 300,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownItemSelected: {
    backgroundColor: "#f0f9f7",
  },
  dropdownItemText: {
    flex: 1,
    fontSize: 14,
    color: "#617989",
  },
  dropdownItemTextSelected: {
    color: "#222f3e",
    fontWeight: "600",
  },
});
