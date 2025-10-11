import AlertDialog from "@/components/AlertDialog";
import BottomModal from "@/components/BottomModal";
import Button from "@/components/Button";
import Header from "@/components/Header";
import Input from "@/components/Input";
import ImagePicker from "@/components/PhotoPicker";
import Textarea from "@/components/Textarea";
import Trip from "@/components/Trip";
import { useTrips } from "@/contexts/TripContext";
import { Trip as TripType } from "@/lib/database";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const { width } = Dimensions.get("window");

export default function Tab() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"past" | "upcoming">("past");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isTripDetailsModalVisible, setIsTripDetailsModalVisible] =
    useState(false);
  const [selectedTrip, setSelectedTrip] = useState<TripType | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const { trips, createTrip, deleteTrip, isLoading } = useTrips();

  // Form state
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

  // Filter trips into past and upcoming based on end date
  const { pastTrips, upcomingTrips } = useMemo(() => {
    const now = new Date();
    const past = trips.filter((trip) => new Date(trip.end_date) < now);
    const upcoming = trips.filter((trip) => new Date(trip.end_date) >= now);
    return { pastTrips: past, upcomingTrips: upcoming };
  }, [trips]);

  // Helper functions
  const calculateDuration = (start: string, end: string): string => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} jour${diffDays > 1 ? "s" : ""}`;
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

  const resetForm = () => {
    setTitle("");
    setStartDate(undefined);
    setEndDate(undefined);
    setImageUri(null);
    setNotes("");
    setErrors({ title: "", startDate: "", endDate: "" });
  };

  const validateForm = (): boolean => {
    const newErrors = {
      title: "",
      destination: "",
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

  const handleCreateTrip = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await createTrip(
        title,
        startDate!,
        endDate!,
        imageUri,
        notes || undefined
      );
      setSuccessMessage("Voyage créé avec succès!");
      setShowSuccessDialog(true);
      setIsModalVisible(false);
      resetForm();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Erreur lors de la création du voyage"
      );
      setShowErrorDialog(true);
    }
  };

  const renderTripCard = (trip: (typeof trips)[0]) => (
    <Trip
      key={trip.id}
      title={trip.title}
      duration={calculateDuration(trip.start_date, trip.end_date)}
      dates={formatDateRange(trip.start_date, trip.end_date)}
      image={trip.image_uri || "https://via.placeholder.com/400x300"}
      onPress={() => router.push(`/(tabs)/map?tripId=${trip.id}`)}
      onLongPress={() => handleTripPress(trip)}
    />
  );

  const handleTabChange = (tab: "past" | "upcoming") => {
    setActiveTab(tab);
    const targetIndex = tab === "past" ? 0 : 1;
    scrollViewRef.current?.scrollTo({
      x: targetIndex * width,
      animated: true,
    });
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(offsetX / width);
    const newTab = currentIndex === 0 ? "past" : "upcoming";

    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  };

  const handleTripPress = (trip: TripType) => {
    setSelectedTrip(trip);
    setIsTripDetailsModalVisible(true);
  };

  const handleDelete = () => {
    if (!selectedTrip) return;
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedTrip) return;

    try {
      await deleteTrip(selectedTrip.id);
      setShowDeleteDialog(false);
      setSuccessMessage("Voyage supprimé avec succès!");
      setShowSuccessDialog(true);
      setIsTripDetailsModalVisible(false);
      setSelectedTrip(null);
    } catch (error) {
      setShowDeleteDialog(false);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression du voyage"
      );
      setShowErrorDialog(true);
    }
  };

  const handleEdit = () => {
    if (!selectedTrip) return;
    setIsTripDetailsModalVisible(false);
    router.push(`/trip-edit?id=${selectedTrip.id}`);
  };

  const handleSharing = () => {
    setSuccessMessage("Fonctionnalité de partage à venir");
    setShowSuccessDialog(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Mes Voyages"
        onPress={() => setIsModalVisible(true)}
        iconPosition="right"
        icon="add"
      />
      <View style={styles.tabsWrapper}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "past" && styles.activeTab]}
            onPress={() => handleTabChange("past")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "past" && styles.activeTabText,
              ]}
            >
              Passés
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "upcoming" && styles.activeTab]}
            onPress={() => handleTabChange("upcoming")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "upcoming" && styles.activeTabText,
              ]}
            >
              A venir
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.horizontalScroll}
      >
        <View style={[styles.page, { width }]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {pastTrips.map(renderTripCard)}
          </ScrollView>
        </View>
        <View style={[styles.page, { width }]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {upcomingTrips.map(renderTripCard)}
          </ScrollView>
        </View>
      </ScrollView>
      <BottomModal
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          resetForm();
        }}
      >
        <View style={styles.modalContent}>
          <Input
            placeholder="Nom du voyage"
            variant="input"
            value={title}
            onChangeText={setTitle}
            error={errors.title}
          />
          <View style={dates.dateContainer}>
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
          <ImagePicker
            onImageSelected={(uri) => {
              setImageUri(uri);
            }}
          />
          <Textarea
            placeholder="Notes (optionnel)"
            value={notes}
            onChangeText={setNotes}
          />
          <Button
            label={isLoading ? "Création..." : "Créer un voyage"}
            onPress={handleCreateTrip}
            variant="btnPrimary"
            color="white"
            disabled={isLoading}
          />
        </View>
      </BottomModal>
      <BottomModal
        visible={isTripDetailsModalVisible}
        onClose={() => {
          setIsTripDetailsModalVisible(false);
          setSelectedTrip(null);
        }}
        enableDynamicSizing={true}
      >
        <View style={styles.tripDetailsContent}>
          <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
            <Ionicons name="settings-outline" size={24} color="#111518" />
            <Text style={styles.menuItemTitle}>Modifier ce voyage</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setSuccessMessage("Fonctionnalité d'impression à venir");
              setShowSuccessDialog(true);
            }}
          >
            <Ionicons name="book-outline" size={24} color="#111518" />
            <Text style={styles.menuItemTitle}>Imprimer un album</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleSharing}>
            <Ionicons name="share-social-outline" size={24} color="#111518" />
            <Text style={styles.menuItemTitle}>Partager le voyage</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={24} color="#e55039" />
            <Text style={[styles.menuItemTitle, { color: "#e55039" }]}>
              Supprimer ce voyage
            </Text>
          </TouchableOpacity>
        </View>
      </BottomModal>

      <AlertDialog
        visible={showDeleteDialog}
        title="Supprimer le voyage"
        message={`Êtes-vous sûr de vouloir supprimer "${selectedTrip?.title}" ?`}
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

const dates = StyleSheet.create({
  dateContainer: {
    flexDirection: "row",
    width: 320,
    gap: 12,
  },
});

const styles = StyleSheet.create({
  modalContent: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  flexInput: {
    flex: 1,
    minWidth: 160,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  tabsWrapper: {
    paddingBottom: 12,
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f3f4",
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
    marginRight: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTab: {
    borderBottomColor: "#1dd1a1",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111518",
    letterSpacing: 0.15,
    lineHeight: 16,
  },
  activeTabText: {
    color: "#1dd1a1",
  },
  content: {
    flex: 1,
  },
  horizontalScroll: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  tripDetailsContent: {
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
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "#111518",
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: "#617989",
    marginTop: 2,
  },
});
