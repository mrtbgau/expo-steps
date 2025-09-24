import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

type RowType = {
  label: string;
  value?: string;
  action?: {
    text: string;
    onPress: () => void;
  };
  toggle?: {
    value: boolean;
    onValueChange: (value: boolean) => void;
  };
};

type Props = {
  title: string;
  rows: RowType[];
};

export default function ProfileSection({ title, rows }: Props) {
  const renderRow = (row: RowType, index: number) => (
    <View key={index} style={styles.row}>
      <Text style={styles.label} numberOfLines={1}>
        {row.label}
      </Text>
      <View style={styles.valueContainer}>
        {row.value ? (
          <Text style={styles.value}>{row.value}</Text>
        ) : row.action ? (
          <TouchableOpacity onPress={row.action.onPress}>
            <Text style={styles.changeButton}>{row.action.text}</Text>
          </TouchableOpacity>
        ) : row.toggle ? (
          <Switch
            value={row.toggle.value}
            onValueChange={row.toggle.onValueChange}
            trackColor={{ false: "#f0f3f4", true: "#1dd1a1" }}
            thumbColor={"#ffffff"}
            ios_backgroundColor="#f0f3f4"
          />
        ) : null}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {rows.map((row, index) => renderRow(row, index))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
  },
  title: {
    color: "#111518",
    fontSize: 18,
    fontWeight: "bold",
    lineHeight: 21.6,
    letterSpacing: -0.27,
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "white",
    paddingHorizontal: 16,
    minHeight: 56,
    justifyContent: "space-between",
  },
  label: {
    color: "#111518",
    fontSize: 16,
    fontWeight: "normal",
    lineHeight: 22.4,
    flex: 1,
  },
  valueContainer: {
    flexShrink: 0,
  },
  value: {
    color: "#111518",
    fontSize: 16,
    fontWeight: "normal",
    lineHeight: 22.4,
  },
  changeButton: {
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 22.4,
    color: "#111518",
  },
});
