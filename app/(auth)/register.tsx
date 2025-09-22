import Button from "@/components/Button";
import Header from "@/components/Header";
import Input from "@/components/Input";
import { useRouter } from "expo-router";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="TripFlow" onPress={() => router.push("/")} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.form}>
          <Input placeholder="Email" />
          <Input placeholder="Mot de passe" />
          <Button
            label="Créer un compte"
            onPress={() => alert("Compte créé !")}
            variant="btnPrimary"
            color="white"
          />
        </View>
        <View style={styles.linkContainer}>
          <Text style={styles.linkText}>Vous avez déjà un compte ? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.link}>Connectez-vous</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 20,
  },
  form: {
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    gap: 20,
  },
  linkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
  linkText: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
  },
  link: {
    color: "#1dd1a1",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
});
