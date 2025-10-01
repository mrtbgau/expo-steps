import { Slot } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "../contexts/AuthContext";
import { TripProvider } from "../contexts/TripContext";

export default function RootLayout() {
  return (
    <GestureHandlerRootView>
      <AuthProvider>
        <TripProvider>
          <Slot />
        </TripProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
