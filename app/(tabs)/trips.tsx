import BottomModal from "@/components/BottomModal";
import Button from "@/components/Button";
import Header from "@/components/Header";
import Input from "@/components/Input";
import ImagePicker from "@/components/PhotoPicker";
import Trip from "@/components/Trip";
import React, { useRef, useState } from "react";
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

interface ITrip {
  id: number;
  title: string;
  duration: string;
  dates: string;
  image: string;
}

export default function Tab() {
  const [activeTab, setActiveTab] = useState<"past" | "upcoming">("past");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const upcomingTrips: ITrip[] = [
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

  const pastTrips: ITrip[] = [
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

  const renderTripCard = (trip: ITrip) => (
    <Trip
      key={trip.id}
      title={trip.title}
      duration={trip.duration}
      dates={trip.dates}
      image={trip.image}
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
        onClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContent}>
          <Input placeholder="Nom du voyage" variant="input" />
          <Input placeholder="Destination" variant="input" />
          <View style={dates.dateContainer}>
            <View style={{ flex: 1 }}>
              <Input placeholder="Date début" variant="input" type="date" />
            </View>
            <View style={{ flex: 1 }}>
              <Input placeholder="Date fin" variant="input" type="date" />
            </View>
          </View>
          <ImagePicker
            onImageSelected={(imageUri) => {
              console.log("Image sélectionnée:", imageUri);
            }}
          />
          <Input placeholder="Notes" variant="textarea" />
          <Button
            label="Créer un voyage"
            onPress={() => setIsModalVisible(false)}
            variant="btnPrimary"
            color="white"
          />
        </View>
      </BottomModal>
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
});
