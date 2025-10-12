import { Slot } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "../contexts/AuthContext";
import { TripProvider } from "../contexts/TripContext";
import { StopProvider } from "../contexts/StopContext";
import { JournalProvider } from "../contexts/JournalContext";
import { ChecklistProvider } from "../contexts/ChecklistContext";
import { SharingProvider } from "../contexts/SharingContext";

export default function RootLayout() {
  return (
    <GestureHandlerRootView>
      <AuthProvider>
        <TripProvider>
          <StopProvider>
            <JournalProvider>
              <ChecklistProvider>
                <SharingProvider>
                  <Slot />
                </SharingProvider>
              </ChecklistProvider>
            </JournalProvider>
          </StopProvider>
        </TripProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
