import Button from "@/components/Button";
import { useRouter } from "expo-router";
import { Image, View } from "react-native";

export default function Index() {
  const router = useRouter();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Image
        source={require("@/assets/images/splash.png")}
        style={{ width: 400, height: 100, marginBottom: 32 }}
      />
      <Button
        label="Créer un compte"
        onPress={() => router.push("/(auth)/register")}
        color="white"
        variant="btnPrimary"
      />
      <Button
        label="Se connecter"
        onPress={() => router.push("/(auth)/login")}
        color="black"
        variant="btnSecondary"
      />
    </View>
  );
}
