import AlertDialog from "@/components/AlertDialog";
import Button from "@/components/Button";
import Dropdown, { DropdownOption } from "@/components/Dropdown";
import Header from "@/components/Header";
import Input from "@/components/Input";
import PhotoGallery from "@/components/journal/PhotoGallery";
import PhotoPicker from "@/components/PhotoPicker";
import Textarea from "@/components/Textarea";
import { useJournal } from "@/contexts/JournalContext";
import { useStops } from "@/contexts/StopContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function JournalEntryScreen() {
  const router = useRouter();
  const { id, tripId } = useLocalSearchParams<{
    id?: string;
    tripId?: string;
  }>();
  const {
    entries,
    photos: entryPhotosMap,
    createEntry,
    updateEntry,
    addPhotosToEntry,
    removePhotoFromEntry,
    isLoading,
  } = useJournal();
  const { stops } = useStops();

  const [title, setTitle] = useState("");
  const [entryDate, setEntryDate] = useState<Date | undefined>(new Date());
  const [content, setContent] = useState("");
  const [selectedStopId, setSelectedStopId] = useState<number | null>(null);
  const [newPhotos, setNewPhotos] = useState<
    { imageUri: string; caption?: string }[]
  >([]);
  const [existingPhotos, setExistingPhotos] = useState<
    { id: number; uri: string; caption?: string }[]
  >([]);

  const [errors, setErrors] = useState({
    title: "",
    entryDate: "",
  });

  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const isEditMode = !!id;
  const currentTripId = parseInt(tripId || "0", 10);

  const stopOptions = useMemo<DropdownOption[]>(() => {
    const options: DropdownOption[] = [
      { id: "none", label: "Aucune étape", icon: "remove-circle-outline" },
    ];

    const tripStops = stops.map((stop) => ({
      id: stop.id,
      label: stop.name,
      icon: "location-outline" as keyof typeof Ionicons.glyphMap,
    }));

    return [...options, ...tripStops];
  }, [stops]);

  useEffect(() => {
    if (isEditMode) {
      const entryId = parseInt(id!, 10);
      const entry = entries.find((e) => e.id === entryId);

      if (entry) {
        setTitle(entry.title);
        setEntryDate(new Date(entry.entry_date));
        setContent(entry.content || "");
        setSelectedStopId(entry.stop_id);

        const photos = entryPhotosMap.get(entry.id) || [];
        setExistingPhotos(
          photos.map((p) => ({
            id: p.id,
            uri: p.image_uri,
            caption: p.caption || undefined,
          }))
        );
      }
    }
  }, [id, entries, entryPhotosMap, isEditMode]);

  const validateForm = (): boolean => {
    const newErrors = {
      title: "",
      entryDate: "",
    };

    if (!title.trim()) {
      newErrors.title = "Le titre est requis";
    }

    if (!entryDate) {
      newErrors.entryDate = "La date est requise";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (isEditMode) {
        const entryId = parseInt(id!, 10);
        await updateEntry(
          entryId,
          entryDate!,
          title,
          content || undefined,
          selectedStopId || undefined
        );

        if (newPhotos.length > 0) {
          await addPhotosToEntry(entryId, newPhotos);
        }

        setSuccessMessage("Entrée mise à jour avec succès!");
      } else {
        await createEntry(
          currentTripId,
          entryDate!,
          title,
          content || undefined,
          selectedStopId || undefined,
          undefined,
          newPhotos
        );

        setSuccessMessage("Entrée créée avec succès!");
      }

      setShowSuccessDialog(true);
      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'enregistrement de l'entrée"
      );
      setShowErrorDialog(true);
    }
  };

  const handleAddPhoto = (uri: string) => {
    setNewPhotos((prev) => [...prev, { imageUri: uri }]);
  };

  const handleRemoveNewPhoto = (index: number) => {
    setNewPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingPhoto = async (photoId: number) => {
    try {
      await removePhotoFromEntry(photoId);
      setExistingPhotos((prev) => prev.filter((p) => p.id !== photoId));
    } catch {
      setErrorMessage("Erreur lors de la suppression de la photo");
      setShowErrorDialog(true);
    }
  };

  const handleStopChange = (value: string | number) => {
    if (value === "none") {
      setSelectedStopId(null);
    } else {
      setSelectedStopId(value as number);
    }
  };

  const allPhotosForDisplay = [
    ...existingPhotos,
    ...newPhotos.map((p, index) => ({
      id: -index - 1,
      uri: p.imageUri,
      caption: p.caption,
    })),
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={isEditMode ? "Modifier l'entrée" : "Nouvelle entrée"}
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
              placeholder="Titre de l'entrée"
              variant="input"
              value={title}
              onChangeText={setTitle}
              error={errors.title}
            />

            <Input
              placeholder="Date"
              variant="input"
              type="date"
              value={entryDate}
              onDateChange={setEntryDate}
              error={errors.entryDate}
            />

            {stopOptions.length > 1 && (
              <View style={styles.fullWidth}>
                <Text style={styles.label}>Étape (optionnel)</Text>
                <Dropdown
                  value={selectedStopId || "none"}
                  options={stopOptions}
                  onChange={handleStopChange}
                />
              </View>
            )}

            <Textarea
              placeholder="Racontez votre journée..."
              value={content}
              onChangeText={setContent}
              style={{ height: 150 }}
            />

            <View style={styles.fullWidth}>
              <Text style={styles.label}>Photos</Text>
              {allPhotosForDisplay.length > 0 && (
                <PhotoGallery
                  photos={allPhotosForDisplay}
                  onRemovePhoto={(photoId) => {
                    if (photoId < 0) {
                      handleRemoveNewPhoto(-photoId - 1);
                    } else {
                      handleRemoveExistingPhoto(photoId);
                    }
                  }}
                  editable={true}
                />
              )}
              <PhotoPicker onImageSelected={handleAddPhoto} />
            </View>
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
        visible={showSuccessDialog}
        title="Succès"
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
  content: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingBottom: 20,
  },
  fullWidth: {
    width: 320,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111518",
    marginBottom: 8,
  },
});
