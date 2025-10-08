import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface LocationResult {
  place_id: number;
  name: string;
  city?: string;
  country?: string;
  lat: number;
  lon: number;
  display_name: string;
}

interface Props {
  placeholder?: string;
  onLocationSelected: (
    location: string,
    latitude: number,
    longitude: number
  ) => void;
  error?: string;
  initialLocation?: string;
}

export default function LocationSearchInput({
  placeholder = "Rechercher un lieu",
  onLocationSelected,
  error,
  initialLocation,
}: Props) {
  const [query, setQuery] = useState(initialLocation || "");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      searchLocation(query);
    }, 300);

    setDebounceTimer(timer);

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [query]);

  const searchLocation = async (searchQuery: string) => {
    if (searchQuery.length < 3) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=5`
      );
      const data = await response.json();

      const formattedResults: LocationResult[] = data.features.map(
        (feature: any) => ({
          place_id: feature.properties.osm_id,
          name: feature.properties.name || "",
          city: feature.properties.city,
          country: feature.properties.country,
          lat: feature.geometry.coordinates[1],
          lon: feature.geometry.coordinates[0],
          display_name:
            feature.properties.name ||
            feature.properties.street ||
            feature.properties.city ||
            "",
        })
      );

      setResults(formattedResults);
      setShowDropdown(true);
    } catch (err) {
      console.error("Error searching location:", err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectLocation = (location: LocationResult) => {
    const displayText = [location.name, location.city, location.country]
      .filter(Boolean)
      .join(", ");

    setQuery(displayText);
    setShowDropdown(false);
    setResults([]);
    onLocationSelected(displayText, location.lat, location.lon);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setShowDropdown(false);
    onLocationSelected("", 0, 0);
  };

  const formatLocationDetails = (location: LocationResult): string => {
    const parts = [location.city, location.country].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "";
  };

  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, error && styles.errorBorder]}>
        <Ionicons
          name="search-outline"
          size={20}
          color="#617989"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#617989"
          value={query}
          onChangeText={setQuery}
          onFocus={() => {
            if (results.length > 0) {
              setShowDropdown(true);
            }
          }}
        />
        {isLoading && (
          <ActivityIndicator
            size="small"
            color="#1dd1a1"
            style={styles.loader}
          />
        )}
        {query.length > 0 && !isLoading && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#617989" />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={16} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {showDropdown && results.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList
            data={results}
            keyExtractor={(item) => item.place_id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => handleSelectLocation(item)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="location-outline"
                  size={20}
                  color="#617989"
                  style={styles.resultIcon}
                />
                <View style={styles.resultTextContainer}>
                  <Text style={styles.resultName} numberOfLines={1}>
                    {item.name || item.display_name}
                  </Text>
                  {formatLocationDetails(item) && (
                    <Text style={styles.resultDetails} numberOfLines={1}>
                      {formatLocationDetails(item)}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
            scrollEnabled={false}
            nestedScrollEnabled={false}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    position: "relative",
    zIndex: 1000,
  },
  inputContainer: {
    width: "100%",
    maxWidth: 320,
    height: 56,
    backgroundColor: "#f0f3f4",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#111518",
  },
  loader: {
    marginLeft: 8,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  errorBorder: {
    borderWidth: 1,
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 4,
    maxWidth: 320,
    width: "100%",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
    marginLeft: 4,
    flex: 1,
  },
  dropdown: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "white",
    borderRadius: 12,
    marginTop: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    maxHeight: 250,
    overflow: "hidden",
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f3f4",
  },
  resultIcon: {
    marginRight: 12,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    color: "#111518",
    fontWeight: "500",
    marginBottom: 2,
  },
  resultDetails: {
    fontSize: 14,
    color: "#617989",
  },
});
