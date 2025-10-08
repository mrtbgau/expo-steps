import AlertDialog from "@/components/AlertDialog";
import Button from "@/components/Button";
import Header from "@/components/Header";
import Input from "@/components/Input";
import LocationSearchInput from "@/components/LocationSearchInput";
import PhotoPicker from "@/components/PhotoPicker";
import Textarea from "@/components/Textarea";
import { useStops } from "@/contexts/StopContext";
import { useTrips } from "@/contexts/TripContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StopEdit() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { stops, updateStop, isLoading } = useStops();
  const { trips } = useTrips();
  const [stop, setStop] = useState<any>(null);
  const [trip, setTrip] = useState<any>(null);

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [stopLocation, setStopLocation] = useState("");
  const [stopLatitude, setStopLatitude] = useState(0);
  const [stopLongitude, setStopLongitude] = useState(0);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });

  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const stopId = parseInt(id || "0", 10);
    const foundStop = stops.find((s) => s.id === stopId);
    setStop(foundStop || null);

    if (foundStop) {
      setName(foundStop.name);
      setStartDate(new Date(foundStop.start_date));
      setEndDate(new Date(foundStop.end_date));
      setStopLatitude(foundStop.latitude || 0);
      setStopLongitude(foundStop.longitude || 0);
      setImageUri(foundStop.image_uri);
      setNotes(foundStop.notes || "");

      const foundTrip = trips.find((t) => t.id === foundStop.trip_id);
      setTrip(foundTrip || null);

      if (foundStop.latitude && foundStop.longitude) {
        fetch(
          `https://photon.komoot.io/reverse?lon=${foundStop.longitude}&lat=${foundStop.latitude}&lang=fr`
        )
          .then((response) => response.json())
          .then((data) => {
            if (data.features && data.features.length > 0) {
              const feature = data.features[0];
              const props = feature.properties;
              console.log("Reverse geocoding data:", props);

              const locationParts = [
                props.name || props.city,
                props.state,
                props.country,
              ].filter(Boolean);
              setStopLocation(locationParts.join(", "));
            }
          })
          .catch((error) => {
            console.error("Error reverse geocoding:", error);
          });
      }
    }
  }, [id, stops, trips]);

  const validateForm = (): boolean => {
    const newErrors = {
      name: "",
      startDate: "",
      endDate: "",
    };

    if (!name.trim()) {
      newErrors.name = "Le nom de l'étape est requis";
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

    // Validate that stop dates are within trip dates
    if (trip && startDate && endDate) {
      const normalizeDate = (date: Date) =>
        new Date(date.getFullYear(), date.getMonth(), date.getDate());

      const normalizedStopStart = normalizeDate(startDate);
      const normalizedStopEnd = normalizeDate(endDate);
      const normalizedTripStart = normalizeDate(new Date(trip.start_date));
      const normalizedTripEnd = normalizeDate(new Date(trip.end_date));

      if (normalizedStopStart < normalizedTripStart) {
        newErrors.startDate =
          "La date de début de l'étape doit être dans les dates du voyage";
      }

      if (normalizedStopEnd > normalizedTripEnd) {
        newErrors.endDate =
          "La date de fin de l'étape doit être dans les dates du voyage";
      }

      // Check for overlapping stops (exclude current stop being edited, allow consecutive stops)
      const hasOverlap = stops.some((existingStop) => {
        // Skip checking against itself
        if (stop && existingStop.id === stop.id) {
          return false;
        }

        const existingStart = normalizeDate(new Date(existingStop.start_date));
        const existingEnd = normalizeDate(new Date(existingStop.end_date));

        // Check if date ranges overlap (but allow touching at boundaries)
        return (
          (normalizedStopStart > existingStart &&
            normalizedStopStart < existingEnd) ||
          (normalizedStopEnd > existingStart &&
            normalizedStopEnd < existingEnd) ||
          (normalizedStopStart <= existingStart &&
            normalizedStopEnd >= existingEnd)
        );
      });

      if (hasOverlap) {
        newErrors.startDate = "Une étape existe déjà sur ces dates";
      }
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSave = async () => {
    if (!stop || !validateForm()) return;

    try {
      const lat = stopLatitude !== 0 ? stopLatitude : undefined;
      const lng = stopLongitude !== 0 ? stopLongitude : undefined;

      await updateStop(
        stop.id,
        name,
        startDate!,
        endDate!,
        lat,
        lng,
        imageUri || undefined,
        notes || undefined
      );

      router.back();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour de l'étape"
      );
      setShowErrorDialog(true);
    }
  };

  if (!stop) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header
          title="Modifier l'étape"
          onPress={() => router.back()}
          icon="arrow-back"
          iconPosition="left"
        />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Étape introuvable</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Modifier l'étape"
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
              placeholder="Nom de l'étape"
              variant="input"
              value={name}
              onChangeText={setName}
              error={errors.name}
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
            <LocationSearchInput
              placeholder="Rechercher un lieu (optionnel)"
              onLocationSelected={(location, lat, lng) => {
                setStopLocation(location);
                setStopLatitude(lat);
                setStopLongitude(lng);
              }}
              initialLocation={stopLocation}
            />
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
  locationContainer: {
    flexDirection: "row",
    width: 320,
    gap: 12,
  },
});
