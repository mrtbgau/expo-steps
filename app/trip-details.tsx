import Button from "@/components/Button";
import Header from "@/components/Header";
import { useTrips } from "@/contexts/TripContext";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Trip } from "@/lib/database";

export default function TripDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { trips, deleteTrip } = useTrips();
  const [trip, setTrip] = useState<Trip | null>(null);

  useEffect(() => {
    const tripId = parseInt(id || "0", 10);
    const foundTrip = trips.find((t) => t.id === tripId);
    setTrip(foundTrip || null);
  }, [id, trips]);

  const handleDelete = () => {
    if (!trip) return;

    Alert.alert(
      "Supprimer le voyage",
      `Êtes-vous sûr de vouloir supprimer "${trip.title}" ? Cette action est irréversible.`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTrip(trip.id);
              Alert.alert("Succès", "Voyage supprimé avec succès!");
              router.back();
            } catch (error) {
              Alert.alert(
                "Erreur",
                error instanceof Error
                  ? error.message
                  : "Erreur lors de la suppression du voyage"
              );
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    // TODO: Navigate to edit screen or open edit modal
    Alert.alert("Info", "Fonctionnalité d'édition à venir");
  };

  if (!trip) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Détails du voyage" onPress={() => router.back()} icon="arrow-back" />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Voyage introuvable</Text>
        </View>
      </SafeAreaView>
    );
  }

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
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return `${startDate.toLocaleDateString("fr-FR", options)} - ${endDate.toLocaleDateString("fr-FR", options)}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Détails du voyage" onPress={() => router.back()} icon="arrow-back" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: trip.image_uri || "https://via.placeholder.com/400x300" }}
          style={styles.image}
        />
        <View style={styles.content}>
          <Text style={styles.title}>{trip.title}</Text>
          <Text style={styles.destination}>{trip.destination}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Durée:</Text>
            <Text style={styles.value}>
              {calculateDuration(trip.start_date, trip.end_date)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Dates:</Text>
            <Text style={styles.value}>
              {formatDateRange(trip.start_date, trip.end_date)}
            </Text>
          </View>
          {trip.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.label}>Notes:</Text>
              <Text style={styles.notes}>{trip.notes}</Text>
            </View>
          )}
        </View>
      </ScrollView>
      <View style={styles.actions}>
        <Button
          label="Modifier"
          onPress={handleEdit}
          variant="btnSecondary"
          color="#1dd1a1"
        />
        <Button
          label="Supprimer"
          onPress={handleDelete}
          variant="btnSecondary"
          color="#e55039"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  image: {
    width: "100%",
    height: 300,
    backgroundColor: "#f0f0f0",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111518",
    marginBottom: 8,
  },
  destination: {
    fontSize: 18,
    color: "#617989",
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111518",
    marginRight: 8,
  },
  value: {
    fontSize: 16,
    color: "#617989",
  },
  notesSection: {
    marginTop: 24,
  },
  notes: {
    fontSize: 16,
    color: "#617989",
    marginTop: 8,
    lineHeight: 24,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f3f4",
  },
});