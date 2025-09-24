import Header from "@/components/Header";
import Avatar from "@/components/profile/Avatar";
import ProfileSection from "@/components/profile/ProfileSection";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  const { user } = useAuth();
  const userMail = user?.email || "default@example.com";
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Mon profil" />
      <Avatar userMail={userMail} />
      <ProfileSection
        title="Compte"
        rows={[
          { label: "Email", value: userMail },
          {
            label: "Mot de passe",
            action: {
              text: "Modifier",
              onPress: () => Alert.alert("Mot de passe modifié !"),
            },
          },
        ]}
      />
      <ProfileSection
        title="Paramètres"
        rows={[
          {
            label: "Notifications",
            toggle: {
              value: notificationsEnabled,
              onValueChange: setNotificationsEnabled,
            },
          },
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
});
