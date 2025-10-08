import AlertDialog from "@/components/AlertDialog";
import BottomModal from "@/components/BottomModal";
import Button from "@/components/Button";
import Header from "@/components/Header";
import Input from "@/components/Input";
import LocationSearchInput from "@/components/LocationSearchInput";
import PhotoPicker from "@/components/PhotoPicker";
import StopCard from "@/components/StopCard";
import Textarea from "@/components/Textarea";
import { useStops } from "@/contexts/StopContext";
import { useTrips } from "@/contexts/TripContext";
import { Trip } from "@/lib/database";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TripEdit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { trips, updateTrip, isLoading: tripLoading } = useTrips();
  const {
    stops,
    setCurrentTripId,
    createStop,
    deleteStop,
    isLoading: stopLoading,
  } = useStops();
  const [trip, setTrip] = useState<Trip | null>(null);

  // Trip form state
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

  // Stop management state
  const [isStopModalVisible, setIsStopModalVisible] = useState(false);
  const [isStopActionsModalVisible, setIsStopActionsModalVisible] =
    useState(false);
  const [selectedStop, setSelectedStop] = useState<any>(null);

  // Stop form state
  const [stopName, setStopName] = useState("");
  const [stopStartDate, setStopStartDate] = useState<Date | undefined>(
    undefined
  );
  const [stopEndDate, setStopEndDate] = useState<Date | undefined>(undefined);
  const [stopLocation, setStopLocation] = useState("");
  const [stopLatitude, setStopLatitude] = useState(0);
  const [stopLongitude, setStopLongitude] = useState(0);
  const [stopImageUri, setStopImageUri] = useState<string | null>(null);
  const [stopNotes, setStopNotes] = useState("");
  const [stopErrors, setStopErrors] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });

  // Dialog state
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showDeleteStopDialog, setShowDeleteStopDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const tripId = parseInt(id || "0", 10);
    const foundTrip = trips.find((t) => t.id === tripId);
    setTrip(foundTrip || null);
    setCurrentTripId(tripId);

    if (foundTrip) {
      setTitle(foundTrip.title);
      setStartDate(new Date(foundTrip.start_date));
      setEndDate(new Date(foundTrip.end_date));
      setImageUri(foundTrip.image_uri);
      setNotes(foundTrip.notes || "");
    }
  }, [id, trips, setCurrentTripId]);

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
      router.back();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour du voyage"
      );
      setShowErrorDialog(true);
    }
  };

  // Stop management functions
  const resetStopForm = () => {
    setStopName("");
    setStopStartDate(undefined);
    setStopEndDate(undefined);
    setStopLocation("");
    setStopLatitude(0);
    setStopLongitude(0);
    setStopImageUri(null);
    setStopNotes("");
    setStopErrors({ name: "", startDate: "", endDate: "" });
  };

  const validateStopForm = (): boolean => {
    const newErrors = {
      name: "",
      startDate: "",
      endDate: "",
    };

    if (!stopName.trim()) {
      newErrors.name = "Le nom de l'étape est requis";
    }

    if (!stopStartDate) {
      newErrors.startDate = "La date de début est requise";
    }

    if (!stopEndDate) {
      newErrors.endDate = "La date de fin est requise";
    }

    if (stopStartDate && stopEndDate && stopStartDate > stopEndDate) {
      newErrors.endDate = "La date de fin doit être après la date de début";
    }

    // Validate that stop dates are within trip dates
    if (stopStartDate && stopEndDate && startDate && endDate) {
      const normalizeDate = (date: Date) =>
        new Date(date.getFullYear(), date.getMonth(), date.getDate());

      const normalizedStopStart = normalizeDate(stopStartDate);
      const normalizedStopEnd = normalizeDate(stopEndDate);
      const normalizedTripStart = normalizeDate(startDate);
      const normalizedTripEnd = normalizeDate(endDate);

      if (normalizedStopStart < normalizedTripStart) {
        newErrors.startDate =
          "La date de début de l'étape doit être dans les dates du voyage";
      }

      if (normalizedStopEnd > normalizedTripEnd) {
        newErrors.endDate =
          "La date de fin de l'étape doit être dans les dates du voyage";
      }

      // Check for overlapping stops (allow consecutive stops that share a boundary date)
      const hasOverlap = stops.some((existingStop) => {
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

    setStopErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleCreateStop = async () => {
    if (!trip || !validateStopForm()) return;

    try {
      const lat = stopLatitude !== 0 ? stopLatitude : undefined;
      const lng = stopLongitude !== 0 ? stopLongitude : undefined;

      await createStop(
        trip.id,
        stopName,
        stopStartDate!,
        stopEndDate!,
        lat,
        lng,
        undefined,
        stopImageUri || undefined,
        stopNotes || undefined
      );

      setSuccessMessage("Étape créée avec succès!");
      setShowSuccessDialog(true);
      setIsStopModalVisible(false);
      resetStopForm();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Erreur lors de la création de l'étape"
      );
      setShowErrorDialog(true);
    }
  };

  const handleStopLongPress = (stop: any) => {
    setSelectedStop(stop);
    setIsStopActionsModalVisible(true);
  };

  const handleEditStop = () => {
    if (!selectedStop) return;
    setIsStopActionsModalVisible(false);
    router.push(`/stop-edit?id=${selectedStop.id}`);
  };

  const handleDeleteStop = () => {
    if (!selectedStop) return;
    setShowDeleteStopDialog(true);
  };

  const confirmDeleteStop = async () => {
    if (!selectedStop) return;

    try {
      await deleteStop(selectedStop.id);
      setShowDeleteStopDialog(false);
      setSuccessMessage("Étape supprimée avec succès!");
      setShowSuccessDialog(true);
      setIsStopActionsModalVisible(false);
      setSelectedStop(null);
    } catch (error) {
      setShowDeleteStopDialog(false);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression de l'étape"
      );
      setShowErrorDialog(true);
    }
  };

  const formatDateRange = (start: string, end: string): string => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };
    return `${startDate.toLocaleDateString(
      "fr-FR",
      options
    )} - ${endDate.toLocaleDateString("fr-FR", options)}`;
  };

  const formatLocation = (
    lat: number | null,
    lng: number | null
  ): string | undefined => {
    if (!lat || !lng) return undefined;
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
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
          contentContainerStyle={styles.scrollContent}
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

            {/* Stops Section */}
            <View style={styles.stopsSection}>
              <View style={styles.stopsSectionHeader}>
                <Text style={styles.stopsTitle}>Étapes du voyage</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setIsStopModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={24}
                    color="#1dd1a1"
                  />
                  <Text style={styles.addButtonText}>Ajouter</Text>
                </TouchableOpacity>
              </View>

              {stops.length === 0 ? (
                <View style={styles.emptyStops}>
                  <Ionicons name="location-outline" size={48} color="#d1d5db" />
                  <Text style={styles.emptyText}>Aucune étape</Text>
                </View>
              ) : (
                <View style={styles.stopsList}>
                  {stops.map((stop, index) => (
                    <View key={stop.id} style={styles.stopItemContainer}>
                      <View style={styles.stopCardWrapper}>
                        <StopCard
                          name={stop.name}
                          dates={formatDateRange(
                            stop.start_date,
                            stop.end_date
                          )}
                          location={formatLocation(
                            stop.latitude,
                            stop.longitude
                          )}
                          image={stop.image_uri}
                          onLongPress={() => handleStopLongPress(stop)}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        <Button
          label={tripLoading ? "Enregistrement..." : "Enregistrer"}
          onPress={handleSave}
          variant="btnPrimary"
          color="white"
          disabled={tripLoading}
        />
      </View>

      {/* Stop Creation Modal */}
      <BottomModal
        visible={isStopModalVisible}
        onClose={() => {
          setIsStopModalVisible(false);
          resetStopForm();
        }}
      >
        <View style={stopCreationModal.modalContent}>
          <Input
            placeholder="Nom de l'étape"
            variant="input"
            value={stopName}
            onChangeText={setStopName}
            error={stopErrors.name}
          />
          <View style={stopCreationModal.dateContainer}>
            <View style={{ flex: 1 }}>
              <Input
                placeholder="Date début"
                variant="input"
                type="date"
                value={stopStartDate}
                onDateChange={setStopStartDate}
                error={stopErrors.startDate}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                placeholder="Date fin"
                variant="input"
                type="date"
                value={stopEndDate}
                onDateChange={setStopEndDate}
                error={stopErrors.endDate}
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
            onImageSelected={(uri) => setStopImageUri(uri)}
            initialImage={stopImageUri}
          />
          <Textarea
            placeholder="Notes (optionnel)"
            value={stopNotes}
            onChangeText={setStopNotes}
          />
          <Button
            label={stopLoading ? "Enregistrement..." : "Enregistrer"}
            onPress={handleCreateStop}
            variant="btnPrimary"
            color="white"
            disabled={stopLoading}
          />
        </View>
      </BottomModal>

      {/* Stop Actions Modal */}
      <BottomModal
        visible={isStopActionsModalVisible}
        onClose={() => {
          setIsStopActionsModalVisible(false);
          setSelectedStop(null);
        }}
        enableDynamicSizing={true}
      >
        <View style={styles.actionsContent}>
          <TouchableOpacity style={styles.actionItem} onPress={handleEditStop}>
            <Ionicons name="create-outline" size={24} color="#111518" />
            <Text style={styles.actionItemTitle}>Modifier cette étape</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={handleDeleteStop}
          >
            <Ionicons name="trash-outline" size={24} color="#e55039" />
            <Text style={[styles.actionItemTitle, { color: "#e55039" }]}>
              Supprimer cette étape
            </Text>
          </TouchableOpacity>
        </View>
      </BottomModal>

      {/* Dialogs */}
      <AlertDialog
        visible={showDeleteStopDialog}
        title="Supprimer l'étape"
        message={`Êtes-vous sûr de vouloir supprimer "${selectedStop?.name}" ?`}
        variant="danger"
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={confirmDeleteStop}
        onCancel={() => setShowDeleteStopDialog(false)}
      />

      <AlertDialog
        visible={showSuccessDialog}
        title="Info"
        message={successMessage}
        confirmText="OK"
        onConfirm={() => setShowSuccessDialog(false)}
      />

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

const stopCreationModal = StyleSheet.create({
  modalContent: {
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
});

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
  scrollContent: {
    paddingBottom: 20,
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
  modalContent: {
    flex: 1,
    maxHeight: 700,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111518",
    marginBottom: 24,
    textAlign: "center",
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    paddingBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    justifyContent: "center",
  },
  stopsSection: {
    width: "100%",
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#f0f3f4",
  },
  stopsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  stopsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111518",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1dd1a1",
  },
  stopsList: {
    gap: 8,
  },
  stopItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stopCardWrapper: {
    flex: 1,
  },
  reorderButtons: {
    flexDirection: "column",
    gap: 4,
  },
  reorderButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  reorderButtonDisabled: {
    backgroundColor: "#f8f9fa",
  },
  emptyStops: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#617989",
  },
  actionsContent: {
    flexDirection: "column",
    paddingBottom: 20,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 4,
    gap: 16,
  },
  actionItemTitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "#111518",
  },
});
