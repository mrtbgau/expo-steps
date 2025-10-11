import BottomModal from "@/components/BottomModal";
import { useStops } from "@/contexts/StopContext";
import { useTrips } from "@/contexts/TripContext";
import { Stop } from "@/lib/database";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Callout, Marker, Polyline, Region } from "react-native-maps";

const DEFAULT_REGION: Region = {
  latitude: 48.8566,
  longitude: 2.3522,
  latitudeDelta: 10,
  longitudeDelta: 10,
};

export default function MapScreen() {
  const router = useRouter();
  const { trips, isLoading: tripsLoading } = useTrips();
  const { stops, setCurrentTripId, isLoading: stopsLoading } = useStops();
  const [selectedTripId, setSelectedTripId] = useState<number | "all">("all");
  const [showTripSelector, setShowTripSelector] = useState(false);
  const [mapRegion, setMapRegion] = useState<Region>(DEFAULT_REGION);

  const selectedTrip = useMemo(() => {
    if (selectedTripId === "all") return null;
    return trips.find((t) => t.id === selectedTripId) || null;
  }, [selectedTripId, trips]);

  const filteredStops = useMemo(() => {
    const stopsWithCoords = stops.filter(
      (stop) => stop.latitude !== null && stop.longitude !== null
    );
    return stopsWithCoords.sort(
      (a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );
  }, [stops]);

  useEffect(() => {
    if (selectedTripId === "all") {
      setCurrentTripId(null);
    } else {
      setCurrentTripId(selectedTripId);
    }
  }, [selectedTripId, setCurrentTripId]);

  useEffect(() => {
    if (filteredStops.length > 0) {
      const region = calculateRegion(filteredStops);
      setMapRegion(region);
    }
  }, [filteredStops]);

  const calculateRegion = (stopsData: Stop[]): Region => {
    if (stopsData.length === 0) return DEFAULT_REGION;

    const lats = stopsData.map((s) => s.latitude!);
    const lons = stopsData.map((s) => s.longitude!);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    const centerLat = (minLat + maxLat) / 2;
    const centerLon = (minLon + maxLon) / 2;
    const latDelta = (maxLat - minLat) * 1.5 || 0.01;
    const lonDelta = (maxLon - minLon) * 1.5 || 0.01;

    return {
      latitude: centerLat,
      longitude: centerLon,
      latitudeDelta: latDelta,
      longitudeDelta: lonDelta,
    };
  };

  const handleTripSelect = (tripId: number | "all") => {
    setSelectedTripId(tripId);
    setShowTripSelector(false);
  };

  const handleMarkerPress = (stop: Stop) => {
    console.log("Marker pressed:", stop.name);
  };

  const handleCalloutPress = (stopId: number) => {
    router.push(`/stop-edit?id=${stopId}`);
  };

  const polylineCoordinates = useMemo(() => {
    if (selectedTripId === "all" || filteredStops.length === 0) return [];
    return filteredStops.map((stop) => ({
      latitude: stop.latitude!,
      longitude: stop.longitude!,
    }));
  }, [filteredStops, selectedTripId]);

  const renderTripSelector = () => (
    <View style={styles.tripSelectorContainer}>
      <Pressable
        style={styles.tripSelectorButton}
        onPress={() => setShowTripSelector(true)}
      >
        <Text style={styles.tripSelectorText}>
          {selectedTrip ? selectedTrip.title : "Tous les voyages"}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#222f3e" />
      </Pressable>
    </View>
  );

  const renderEmptyState = () => {
    if (tripsLoading || stopsLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#1dd1a1" />
          <Text style={styles.emptyText}>Chargement...</Text>
        </View>
      );
    }

    if (trips.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="map-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>Aucun voyage</Text>
          <Text style={styles.emptyText}>
            Créez votre premier voyage pour voir vos étapes sur la carte
          </Text>
        </View>
      );
    }

    if (filteredStops.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="location-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>Aucune étape</Text>
          <Text style={styles.emptyText}>
            Ajoutez des étapes avec des coordonnées pour les voir sur la carte
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      {renderTripSelector()}

      {filteredStops.length > 0 ? (
        <MapView style={styles.map} region={mapRegion} showsUserLocation>
          {filteredStops.map((stop, index) => (
            <Marker
              key={stop.id}
              coordinate={{
                latitude: stop.latitude!,
                longitude: stop.longitude!,
              }}
              onPress={() => handleMarkerPress(stop)}
            >
              <View style={styles.markerContainer}>
                <View style={styles.marker}>
                  <Text style={styles.markerText}>{index + 1}</Text>
                </View>
              </View>
              <Callout onPress={() => handleCalloutPress(stop.id)}>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{stop.name}</Text>
                  <Text style={styles.calloutDate}>
                    {new Date(stop.start_date).toLocaleDateString("fr-FR")} -{" "}
                    {new Date(stop.end_date).toLocaleDateString("fr-FR")}
                  </Text>
                  <Text style={styles.calloutAction}>Voir détails →</Text>
                </View>
              </Callout>
            </Marker>
          ))}

          {polylineCoordinates.length > 1 && (
            <Polyline
              coordinates={polylineCoordinates}
              strokeColor="#1dd1a1"
              strokeWidth={3}
            />
          )}
        </MapView>
      ) : (
        renderEmptyState()
      )}

      <BottomModal
        visible={showTripSelector}
        onClose={() => setShowTripSelector(false)}
        enableDynamicSizing
      >
        <View style={styles.tripSelectorModal}>
          <Text style={styles.modalTitle}>Sélectionner un voyage</Text>

          <TouchableOpacity
            style={[
              styles.tripOption,
              selectedTripId === "all" && styles.tripOptionSelected,
            ]}
            onPress={() => handleTripSelect("all")}
          >
            <Ionicons
              name="globe-outline"
              size={24}
              color={selectedTripId === "all" ? "#1dd1a1" : "#617989"}
            />
            <Text
              style={[
                styles.tripOptionText,
                selectedTripId === "all" && styles.tripOptionTextSelected,
              ]}
            >
              Tous les voyages
            </Text>
            {selectedTripId === "all" && (
              <Ionicons name="checkmark" size={24} color="#1dd1a1" />
            )}
          </TouchableOpacity>

          {trips.map((trip) => (
            <TouchableOpacity
              key={trip.id}
              style={[
                styles.tripOption,
                selectedTripId === trip.id && styles.tripOptionSelected,
              ]}
              onPress={() => handleTripSelect(trip.id)}
            >
              <Ionicons
                name="briefcase-outline"
                size={24}
                color={selectedTripId === trip.id ? "#1dd1a1" : "#617989"}
              />
              <Text
                style={[
                  styles.tripOptionText,
                  selectedTripId === trip.id && styles.tripOptionTextSelected,
                ]}
              >
                {trip.title}
              </Text>
              {selectedTripId === trip.id && (
                <Ionicons name="checkmark" size={24} color="#1dd1a1" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </BottomModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  map: {
    flex: 1,
  },
  tripSelectorContainer: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  tripSelectorButton: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tripSelectorText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222f3e",
    flex: 1,
  },
  markerContainer: {
    alignItems: "center",
  },
  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1dd1a1",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  callout: {
    width: 200,
    padding: 8,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222f3e",
    marginBottom: 4,
  },
  calloutDate: {
    fontSize: 12,
    color: "#617989",
    marginBottom: 8,
  },
  calloutAction: {
    fontSize: 14,
    color: "#1dd1a1",
    fontWeight: "600",
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
  tripSelectorModal: {
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#222f3e",
    marginBottom: 16,
    textAlign: "center",
  },
  tripOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#f8f9fa",
  },
  tripOptionSelected: {
    backgroundColor: "#f0f9f7",
    borderWidth: 1,
    borderColor: "#1dd1a1",
  },
  tripOptionText: {
    flex: 1,
    fontSize: 16,
    color: "#617989",
    marginLeft: 12,
  },
  tripOptionTextSelected: {
    color: "#222f3e",
    fontWeight: "600",
  },
});
