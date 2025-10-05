import AlertDialog from "@/components/AlertDialog";
import Button from "@/components/Button";
import Header from "@/components/Header";
import Input from "@/components/Input";
import PhotoPicker from "@/components/PhotoPicker";
import Textarea from "@/components/Textarea";
import { useTrips } from "@/contexts/TripContext";
import { Trip } from "@/lib/database";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TripDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { trips, updateTrip, isLoading } = useTrips();
  const [trip, setTrip] = useState<Trip | null>(null);

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({
    title: "",
    startDate: "",
    endDate: "",
  });

  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const tripId = parseInt(id || "0", 10);
    const foundTrip = trips.find((t) => t.id === tripId);
    setTrip(foundTrip || null);

    if (foundTrip) {
      setTitle(foundTrip.title);
      setStartDate(new Date(foundTrip.start_date));
      setEndDate(new Date(foundTrip.end_date));
      setImageUri(foundTrip.image_uri);
      setNotes(foundTrip.notes || "");
    }
  }, [id, trips]);

  const validateForm = (): boolean => {
    const newErrors = {
      title: "",
      startDate: "",
      endDate: "",
    };

    if (!title.trim()) {
      newErrors.title = "Le nom du voyage est requis";
    }

    if (!startDate) {
      newErrors.startDate = "La date de début est requise";
    }

    if (!endDate) {
      newErrors.endDate = "La date de fin est requise";
    }

    if (startDate && endDate && startDate > endDate) {
      newErrors.endDate = "La date de fin doit être après la date de début";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSave = async () => {
    if (!trip || !validateForm()) return;

    try {
      await updateTrip(
        trip.id,
        title,
        startDate!,
        endDate!,
        imageUri,
        notes || undefined
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour du voyage"
      );
      setShowErrorDialog(true);
    }
    router.back();
  };

  if (!trip) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header
          title="Modifier le voyage"
          onPress={() => router.back()}
          icon="arrow-back"
          iconPosition="left"
        />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Voyage introuvable</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Modifier le voyage"
        onPress={() => router.back()}
        icon="arrow-back"
        iconPosition="left"
      />
      <View style={styles.safeContainer}>
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Input
              placeholder="Nom du voyage"
              variant="input"
              value={title}
              onChangeText={setTitle}
              error={errors.title}
            />
            <View style={styles.dateContainer}>
              <View style={{ flex: 1 }}>
                <Input
                  placeholder="Date début"
                  variant="input"
                  type="date"
                  value={startDate}
                  onDateChange={setStartDate}
                  error={errors.startDate}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  placeholder="Date fin"
                  variant="input"
                  type="date"
                  value={endDate}
                  onDateChange={setEndDate}
                  error={errors.endDate}
                />
              </View>
            </View>
            <PhotoPicker
              onImageSelected={(uri) => setImageUri(uri)}
              initialImage={imageUri}
            />
            <Textarea
              placeholder="Notes (optionnel)"
              value={notes}
              onChangeText={setNotes}
            />
          </View>
        </ScrollView>
        <Button
          label={isLoading ? "Enregistrement..." : "Enregistrer"}
          onPress={handleSave}
          variant="btnPrimary"
          color="white"
          disabled={isLoading}
        />
      </View>

      <AlertDialog
        visible={showErrorDialog}
        title="Erreur"
        message={errorMessage}
        variant="danger"
        confirmText="OK"
        onConfirm={() => setShowErrorDialog(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    alignItems: "center",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#617989",
  },
  content: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  dateContainer: {
    flexDirection: "row",
    width: 320,
    gap: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
});
