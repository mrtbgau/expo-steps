import Header from "@/components/Header";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

interface Trip {
  id: number;
  title: string;
  duration: string;
  dates: string;
  image: string;
}

export default function Tab() {
  const [activeTab, setActiveTab] = useState<"past" | "upcoming">("past");
  const scrollViewRef = useRef<ScrollView>(null);

  const upcomingTrips: Trip[] = [
    {
      id: 1,
      title: "Paris Getaway",
      duration: "3 days",
      dates: "Oct 12 - Oct 15",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA1LUgr_biGU-LZJCFaqyFo9WayPns6lJdwO1xRIYSTomHLAj5sxWReal7HLPtWC1tQU1x_sZoJEi6J0dMlBCnLEWhFLCOn8BYUrLvl4zYxLHqx1Tz_Lz_afUOappiacJkOyL_5PpEgCYC6jpR40_TnLsB8mt81VKKmsLQasO0bHB1N4LQmns1t8j2ln9RVRXf-xQqstK137A_k6o9sCFGceqd4KfG-qJaGOOVNGZT41pwp499leSD9chJv6SWMxMNFpfbh82Xfo04",
    },
    {
      id: 2,
      title: "London Adventure",
      duration: "5 days",
      dates: "Nov 20 - Nov 25",
      image:
        "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop",
    },
    {
      id: 3,
      title: "Tokyo Discovery",
      duration: "7 days",
      dates: "Dec 5 - Dec 12",
      image:
        "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop",
    },
  ];

  const pastTrips: Trip[] = [
    {
      id: 4,
      title: "Rome Discovery",
      duration: "4 days",
      dates: "Aug 15 - Aug 19",
      image:
        "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=300&fit=crop",
    },
    {
      id: 5,
      title: "Barcelona Escape",
      duration: "6 days",
      dates: "Jul 5 - Jul 11",
      image:
        "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&h=300&fit=crop",
    },
    {
      id: 6,
      title: "Amsterdam Weekend",
      duration: "3 days",
      dates: "Jun 20 - Jun 23",
      image:
        "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400&h=300&fit=crop",
    },
  ];

  const renderTripCard = (trip: Trip) => (
    <TouchableOpacity key={trip.id} style={styles.tripCard} activeOpacity={0.7}>
      <View style={styles.tripInfo}>
        <Text style={styles.duration}>{trip.duration}</Text>
        <Text style={styles.title}>{trip.title}</Text>
        <Text style={styles.dates}>{trip.dates}</Text>
      </View>
      <Image source={{ uri: trip.image }} style={styles.tripImage} />
    </TouchableOpacity>
  );

  const handleTabChange = (tab: "past" | "upcoming") => {
    setActiveTab(tab);
    const targetIndex = tab === "upcoming" ? 0 : 1;
    scrollViewRef.current?.scrollTo({
      x: targetIndex * width,
      animated: true,
    });
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(offsetX / width);
    const newTab = currentIndex === 0 ? "upcoming" : "past";

    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  };

  const handleAddTrip = () => {
    alert("Ajouter un nouveau voyage");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Mes Voyages"
        onPress={handleAddTrip}
        iconPosition="right"
        icon="add"
      />
      <View style={styles.tabsWrapper}>
        <View style={styles.tabsContainer}>
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
              Passés
            </Text>
          </TouchableOpacity>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  tripCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "stretch",
    marginHorizontal: 16,
    marginVertical: 8,
    gap: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 4,
  },
  tripInfo: {
    flex: 2,
    justifyContent: "center",
    gap: 4,
    paddingLeft: 4,
  },
  duration: {
    fontSize: 14,
    color: "#617989",
    fontWeight: "400",
    lineHeight: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111518",
    lineHeight: 20,
  },
  dates: {
    fontSize: 14,
    color: "#617989",
    fontWeight: "400",
    lineHeight: 16,
  },
  tripImage: {
    flex: 1,
    aspectRatio: 16 / 9,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
  },
});
