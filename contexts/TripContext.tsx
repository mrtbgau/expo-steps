import React, { createContext, useContext, useEffect, useState } from "react";
import { tripService, Trip } from "../lib/database";
import { useAuth } from "./AuthContext";

interface TripContextType {
  trips: Trip[];
  isLoading: boolean;
  createTrip: (
    title: string,
    startDate: Date,
    endDate: Date,
    imageUri: string | null,
    notes?: string
  ) => Promise<Trip | null>;
  updateTrip: (
    tripId: number,
    title: string,
    startDate: Date,
    endDate: Date,
    imageUri: string | null,
    notes?: string
  ) => Promise<Trip | null>;
  deleteTrip: (tripId: number) => Promise<boolean>;
  refreshTrips: () => Promise<void>;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export function TripProvider({ children }: { children: React.ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      loadTrips();
    } else {
      setTrips([]);
    }
  }, [user?.id]);

  const loadTrips = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const userTrips = await tripService.getTrips(user.id);
      setTrips(userTrips);
    } catch (error) {
      console.error("Error loading trips:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createTrip = async (
    title: string,
    startDate: Date,
    endDate: Date,
    imageUri: string | null,
    notes?: string
  ): Promise<Trip | null> => {
    if (!user?.id) {
      throw new Error("Vous devez être connecté pour créer un voyage");
    }

    setIsLoading(true);
    try {
      const newTrip = await tripService.createTrip(
        user.id,
        title,
        startDate.toISOString(),
        endDate.toISOString(),
        imageUri,
        notes
      );

      if (newTrip) {
        setTrips((prevTrips) => [newTrip, ...prevTrips]);
      }

      return newTrip;
    } catch (error) {
      console.error("Error creating trip:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTrip = async (
    tripId: number,
    title: string,
    startDate: Date,
    endDate: Date,
    imageUri: string | null,
    notes?: string
  ): Promise<Trip | null> => {
    setIsLoading(true);
    try {
      const updatedTrip = await tripService.updateTrip(
        tripId,
        title,
        startDate.toISOString(),
        endDate.toISOString(),
        imageUri,
        notes
      );

      if (updatedTrip) {
        setTrips((prevTrips) =>
          prevTrips.map((trip) => (trip.id === tripId ? updatedTrip : trip))
        );
      }

      return updatedTrip;
    } catch (error) {
      console.error("Error updating trip:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTrip = async (tripId: number): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await tripService.deleteTrip(tripId);

      if (success) {
        setTrips((prevTrips) => prevTrips.filter((trip) => trip.id !== tripId));
      }

      return success;
    } catch (error) {
      console.error("Error deleting trip:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTrips = async () => {
    await loadTrips();
  };

  return (
    <TripContext.Provider
      value={{
        trips,
        isLoading,
        createTrip,
        updateTrip,
        deleteTrip,
        refreshTrips,
      }}
    >
      {children}
    </TripContext.Provider>
  );
}

export function useTrips() {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error("useTrips must be used within a TripProvider");
  }
  return context;
}
