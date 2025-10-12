import AlertDialog from "@/components/AlertDialog";
import BottomModal from "@/components/BottomModal";
import Dropdown, { DropdownOption } from "@/components/Dropdown";
import Header from "@/components/Header";
import JournalEntryCard from "@/components/journal/JournalEntryCard";
import JournalFilter from "@/components/journal/JournalFilter";
import { useJournal } from "@/contexts/JournalContext";
import { useStops } from "@/contexts/StopContext";
import { useTrips } from "@/contexts/TripContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function JournalScreen() {
  const router = useRouter();
  const { trips } = useTrips();
  const { stops, setCurrentTripId: setStopsTripId } = useStops();
  const {
    entries,
    photos,
    isLoading,
    setCurrentTripId,
    filterByStop,
    setFilterByStop,
    deleteEntry,
  } = useJournal();

  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"date" | "stop">("date");
  const [selectedEntry, setSelectedEntry] = useState<number | null>(null);
  const [isOptionsModalVisible, setIsOptionsModalVisible] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const tripOptions = useMemo<DropdownOption[]>(() => {
    return trips.map((trip) => ({
      id: trip.id,
      label: trip.title,
      icon: "briefcase-outline" as keyof typeof Ionicons.glyphMap,
    }));
  }, [trips]);

  useEffect(() => {
    if (trips.length > 0 && !selectedTripId) {
      const firstTrip = trips[0];
      setSelectedTripId(firstTrip.id);
      setCurrentTripId(firstTrip.id);
      setStopsTripId(firstTrip.id);
    }
  }, [trips, selectedTripId, setCurrentTripId, setStopsTripId]);

  const handleTripChange = (value: string | number) => {
    const tripId = value as number;
    setSelectedTripId(tripId);
    setCurrentTripId(tripId);
    setStopsTripId(tripId);
    setFilterByStop(null);
  };

  const handleViewModeChange = (mode: "date" | "stop") => {
    setViewMode(mode);
    if (mode === "date") {
      setFilterByStop(null);
    }
  };

  const handleEntryPress = (entryId: number) => {
    router.push(`/journal-entry?id=${entryId}`);
  };

  const handleEntryLongPress = (entryId: number) => {
    setSelectedEntry(entryId);
    setIsOptionsModalVisible(true);
  };

  const handleEdit = () => {
    if (!selectedEntry) return;
    setIsOptionsModalVisible(false);
    router.push(`/journal-entry?id=${selectedEntry}`);
  };

  const handleDeleteRequest = () => {
    setIsOptionsModalVisible(false);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedEntry) return;

    try {
      await deleteEntry(selectedEntry);
      setShowDeleteDialog(false);
      setSuccessMessage("Entrée supprimée avec succès!");
      setShowSuccessDialog(true);
      setSelectedEntry(null);
    } catch (error) {
      setShowDeleteDialog(false);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression de l'entrée"
      );
      setShowErrorDialog(true);
    }
  };

  const selectedStop = useMemo(() => {
    if (!filterByStop) return null;
    return stops.find((s) => s.id === filterByStop);
  }, [filterByStop, stops]);

  const renderEntry = ({ item }: { item: any }) => {
    const entryPhotos = photos.get(item.id) || [];
    const thumbnailUri = entryPhotos.length > 0 ? entryPhotos[0].image_uri : undefined;
    const stop = stops.find((s) => s.id === item.stop_id);

    return (
      <JournalEntryCard
        title={item.title}
        date={item.entry_date}
        content={item.content}
        thumbnailUri={thumbnailUri}
        photoCount={entryPhotos.length}
        hasAudio={!!item.audio_uri}
        stopName={stop?.name}
        onPress={() => handleEntryPress(item.id)}
        onLongPress={() => handleEntryLongPress(item.id)}
      />
    );
  };

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#1dd1a1" />
          <Text style={styles.emptyText}>Chargement...</Text>
        </View>
      );
    }

    if (!selectedTripId) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="book-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>Aucun voyage</Text>
          <Text style={styles.emptyText}>
            Créez un voyage pour commencer votre journal
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={64} color="#d1d5db" />
        <Text style={styles.emptyTitle}>Aucune entrée</Text>
        <Text style={styles.emptyText}>
          Appuyez sur + pour ajouter votre première entrée de journal
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Journal de voyage"
        onPress={() => {
          if (!selectedTripId) {
            setErrorMessage("Veuillez sélectionner un voyage");
            setShowErrorDialog(true);
            return;
          }
          router.push(`/journal-entry?tripId=${selectedTripId}`);
        }}
        iconPosition="right"
        icon="add"
      />

      {tripOptions.length > 0 && (
        <View style={styles.tripSelectorContainer}>
          <Dropdown
            value={selectedTripId || ""}
            options={tripOptions}
            onChange={handleTripChange}
          />
        </View>
      )}

      <JournalFilter
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        stopName={selectedStop?.name}
        onClearStopFilter={() => setFilterByStop(null)}
      />

      <FlatList
        data={entries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={
          entries.length === 0 ? styles.emptyListContent : styles.listContent
        }
        ListEmptyComponent={renderEmptyState()}
        showsVerticalScrollIndicator={false}
      />

      <BottomModal
        visible={isOptionsModalVisible}
        onClose={() => {
          setIsOptionsModalVisible(false);
          setSelectedEntry(null);
        }}
        enableDynamicSizing={true}
      >
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
            <Ionicons name="create-outline" size={24} color="#111518" />
            <Text style={styles.menuItemTitle}>Modifier l&apos;entrée</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleDeleteRequest}
          >
            <Ionicons name="trash-outline" size={24} color="#e55039" />
            <Text style={[styles.menuItemTitle, { color: "#e55039" }]}>
              Supprimer l&apos;entrée
            </Text>
          </TouchableOpacity>
        </View>
      </BottomModal>

      <AlertDialog
        visible={showDeleteDialog}
        title="Supprimer l'entrée"
        message="Êtes-vous sûr de vouloir supprimer cette entrée de journal ?"
        variant="danger"
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteDialog(false)}
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  tripSelectorContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#222f3e",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#617989",
    textAlign: "center",
  },
  modalContent: {
    flexDirection: "column",
    paddingBottom: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 4,
    gap: 16,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "#111518",
  },
});
