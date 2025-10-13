import Dropdown, { DropdownOption } from "@/components/Dropdown";
import { useStops } from "@/contexts/StopContext";
import { useTrips } from "@/contexts/TripContext";
import { Stop, stopService } from "@/lib/database";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import MapView, { Callout, Marker, Polyline, Region } from "react-native-maps";

const DEFAULT_REGION: Region = {
  latitude: 48.8566,
  longitude: 2.3522,
  latitudeDelta: 10,
  longitudeDelta: 10,
};

export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const { trips, isLoading: tripsLoading } = useTrips();
  const {
    stops: contextStops,
    setCurrentTripId,
    isLoading: stopsLoading,
  } = useStops();
  const [selectedTripId, setSelectedTripId] = useState<number | "all">("all");
  const [mapRegion, setMapRegion] = useState<Region>(DEFAULT_REGION);
  const [allStops, setAllStops] = useState<Stop[]>([]);
  const [isLoadingAllStops, setIsLoadingAllStops] = useState(false);

  const pastTrips = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return trips.filter((trip) => new Date(trip.end_date) < today);
  }, [trips]);

  useEffect(() => {
    if (tripId) {
      const numericTripId = parseInt(tripId, 10);
      if (!isNaN(numericTripId)) {
        setSelectedTripId(numericTripId);
      }
    }
  }, [tripId]);

  const dropdownOptions = useMemo<DropdownOption[]>(() => {
    return [
      { id: "all", label: "Tous vos voyages passés", icon: "globe-outline" },
      ...pastTrips.map((trip) => ({
        id: trip.id,
        label: trip.title,
        icon: "briefcase-outline" as keyof typeof Ionicons.glyphMap,
      })),
    ];
  }, [pastTrips]);

  useEffect(() => {
    const loadAllStops = async () => {
      if (selectedTripId === "all" && pastTrips.length > 0) {
        setIsLoadingAllStops(true);
        try {
          const allStopsPromises = pastTrips.map((trip) =>
            stopService.getStopsByTripId(trip.id)
          );
          const stopsArrays = await Promise.all(allStopsPromises);
          const combined = stopsArrays.flat();
          setAllStops(combined);
        } catch (error) {
          console.error("Error loading all stops:", error);
        } finally {
          setIsLoadingAllStops(false);
        }
      }
    };

    loadAllStops();
  }, [selectedTripId, pastTrips]);

  const stops = selectedTripId === "all" ? allStops : contextStops;
  const isLoading = selectedTripId === "all" ? isLoadingAllStops : stopsLoading;

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

  const handleTripChange = (value: string | number) => {
    setSelectedTripId(value as number | "all");
  };

  const handleMarkerPress = (stop: Stop) => {
    if (mapRef.current && stop.latitude && stop.longitude) {
      const region: Region = {
        latitude: stop.latitude,
        longitude: stop.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      mapRef.current.animateToRegion(region, 500);
    }
  };

  const handleCalloutPress = (stopId: number) => {
    router.push(`/stop-edit?id=${stopId}`);
  };

  const stopNumberMap = useMemo(() => {
    const map = new Map<number, number>();

    if (selectedTripId === "all") {
      const tripGroups = new Map<number, Stop[]>();
      filteredStops.forEach((stop) => {
        if (!tripGroups.has(stop.trip_id)) {
          tripGroups.set(stop.trip_id, []);
        }
        tripGroups.get(stop.trip_id)!.push(stop);
      });

      tripGroups.forEach((stops) => {
        stops.forEach((stop, index) => {
          map.set(stop.id, index + 1);
        });
      });
    } else {
      filteredStops.forEach((stop, index) => {
        map.set(stop.id, index + 1);
      });
    }

    return map;
  }, [filteredStops, selectedTripId]);

  const polylinesByTrip = useMemo(() => {
    if (filteredStops.length === 0) return [];

    if (selectedTripId === "all") {
      const tripGroups = new Map<number, Stop[]>();
      filteredStops.forEach((stop) => {
        if (!tripGroups.has(stop.trip_id)) {
          tripGroups.set(stop.trip_id, []);
        }
        tripGroups.get(stop.trip_id)!.push(stop);
      });

      return Array.from(tripGroups.values()).map((stops) =>
        stops.map((stop) => ({
          latitude: stop.latitude!,
          longitude: stop.longitude!,
        }))
      );
    }

    return [
      filteredStops.map((stop) => ({
        latitude: stop.latitude!,
        longitude: stop.longitude!,
      })),
    ];
  }, [filteredStops, selectedTripId]);

  const renderEmptyState = () => {
    if (tripsLoading || isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#1dd1a1" />
          <Text style={styles.emptyText}>Chargement...</Text>
        </View>
      );
    }

    if (pastTrips.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="map-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>Aucun voyage passé</Text>
          <Text style={styles.emptyText}>
            Aucun voyage terminé à afficher sur la carte
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
      <View style={styles.tripSelectorContainer}>
        <Dropdown
          value={selectedTripId}
          options={dropdownOptions}
          onChange={handleTripChange}
        />
      </View>

      {filteredStops.length > 0 ? (
        <MapView ref={mapRef} style={styles.map} region={mapRegion} showsUserLocation>
          {filteredStops.map((stop) => (
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
                  <Text style={styles.markerText}>
                    {stopNumberMap.get(stop.id) || 1}
                  </Text>
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

          {polylinesByTrip.map((coordinates, index) =>
            coordinates.length > 1 ? (
              <Polyline
                key={`polyline-${index}`}
                coordinates={coordinates}
                strokeColor="#F6921E"
                strokeWidth={3}
              />
            ) : null
          )}
        </MapView>
      ) : (
        renderEmptyState()
      )}
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
    top: 40,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  markerContainer: {
    alignItems: "center",
  },
  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F6921E",
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
});
