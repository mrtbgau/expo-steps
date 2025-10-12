import { Slot } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "../contexts/AuthContext";
import { TripProvider } from "../contexts/TripContext";
import { StopProvider } from "../contexts/StopContext";
import { JournalProvider } from "../contexts/JournalContext";
import { ChecklistProvider } from "../contexts/ChecklistContext";

export default function RootLayout() {
  return (
    <GestureHandlerRootView>
      <AuthProvider>
        <TripProvider>
          <StopProvider>
            <JournalProvider>
              <ChecklistProvider>
                <Slot />
              </ChecklistProvider>
            </JournalProvider>
          </StopProvider>
        </TripProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
