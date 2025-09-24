import Button from "@/components/Button";
import Header from "@/components/Header";
import Avatar from "@/components/profile/Avatar";
import ProfileSection from "@/components/profile/ProfileSection";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function Profile() {
  const { user } = useAuth();
  const userMail = user?.email || "default@example.com";
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topContent}>
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
      </View>

      <View style={styles.buttonContainer}>
        <Button
          label="Me déconnecter"
          onPress={() => Alert.alert("Déconnecté !")}
          variant="btnSecondary"
          color="black"
        />
        <Button
          label="Supprimer mon compte"
          onPress={() => Alert.alert("Compte supprimé !")}
          variant="btnDanger"
          color="white"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  topContent: {
    flex: 1,
  },
  buttonContainer: {
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
});
