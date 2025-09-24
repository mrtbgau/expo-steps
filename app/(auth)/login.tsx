import Button from "@/components/Button";
import Header from "@/components/Header";
import Input from "@/components/Input";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (!password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (password.length < 6) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 6 caractères";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await login(email.trim().toLowerCase(), password);
      router.replace("/(tabs)/trips");
    } catch (error) {
      Alert.alert(
        "Erreur de connexion",
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    }
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Connexion" onPress={() => router.push("/")} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.form}>
          <Input
            placeholder="Email"
            variant="input"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email)
                setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.email}
          />
          <Input
            placeholder="Mot de passe"
            variant="input"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password)
                setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            secureTextEntry
            error={errors.password}
          />
          <Button
            label="Se connecter"
            onPress={handleLogin}
            variant="btnPrimary"
            color="white"
            disabled={isLoading}
            loading={isLoading}
          />
        </View>
        <View style={styles.linkContainer}>
          <Text style={styles.linkText}>
            {`Vous n'avez pas encore de compte ?`}{" "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
            <Text style={styles.link}>Inscrivez-vous</Text>
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
