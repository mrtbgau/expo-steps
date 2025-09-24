import Header from "@/components/Header";
import Avatar from "@/components/profile/Avatar";
import { useAuth } from "@/contexts/AuthContext";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  const { user } = useAuth();
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Mon profil" />
      <Avatar userMail={user?.email || "default@example.com"} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
});
