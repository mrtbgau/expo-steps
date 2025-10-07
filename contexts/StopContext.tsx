import React, { createContext, useContext, useEffect, useState } from "react";
import { Stop, stopService } from "../lib/database";

interface StopContextType {
  stops: Stop[];
  isLoading: boolean;
  currentTripId: number | null;
  setCurrentTripId: (tripId: number | null) => void;
  createStop: (
    tripId: number,
    name: string,
    startDate: Date,
    endDate: Date,
    latitude?: number,
    longitude?: number,
    description?: string,
    imageUri?: string,
    notes?: string
  ) => Promise<Stop | null>;
  updateStop: (
    stopId: number,
    name: string,
    startDate: Date,
    endDate: Date,
    latitude?: number,
    longitude?: number,
    description?: string,
    imageUri?: string,
    notes?: string
  ) => Promise<Stop | null>;
  deleteStop: (stopId: number) => Promise<boolean>;
  refreshStops: () => Promise<void>;
}

const StopContext = createContext<StopContextType | undefined>(undefined);

export function StopProvider({ children }: { children: React.ReactNode }) {
  const [stops, setStops] = useState<Stop[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTripId, setCurrentTripId] = useState<number | null>(null);

  const loadStops = React.useCallback(async () => {
    if (!currentTripId) return;

    setIsLoading(true);
    try {
      const tripStops = await stopService.getStopsByTripId(currentTripId);
      setStops(tripStops);
    } catch (error) {
      console.error("Error loading stops:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentTripId]);

  useEffect(() => {
    if (currentTripId) {
      loadStops();
    } else {
      setStops([]);
    }
  }, [currentTripId, loadStops]);

  const createStop = async (
    tripId: number,
    name: string,
    startDate: Date,
    endDate: Date,
    latitude?: number,
    longitude?: number,
    description?: string,
    imageUri?: string,
    notes?: string
  ): Promise<Stop | null> => {
    setIsLoading(true);
    try {
      const newStop = await stopService.createStop(
        tripId,
        name,
        startDate.toISOString(),
        endDate.toISOString(),
        latitude,
        longitude,
        description,
        imageUri,
        notes
      );

      if (newStop && currentTripId === tripId) {
        setStops((prevStops) => [...prevStops, newStop]);
      }

      return newStop;
    } catch (error) {
      console.error("Error creating stop:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateStop = async (
    stopId: number,
    name: string,
    startDate: Date,
    endDate: Date,
    latitude?: number,
    longitude?: number,
    description?: string,
    imageUri?: string,
    notes?: string
  ): Promise<Stop | null> => {
    setIsLoading(true);
    try {
      const updatedStop = await stopService.updateStop(
        stopId,
        name,
        startDate.toISOString(),
        endDate.toISOString(),
        latitude,
        longitude,
        description,
        imageUri,
        notes
      );

      if (updatedStop) {
        setStops((prevStops) =>
          prevStops.map((stop) => (stop.id === stopId ? updatedStop : stop))
        );
      }

      return updatedStop;
    } catch (error) {
      console.error("Error updating stop:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteStop = async (stopId: number): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await stopService.deleteStop(stopId);

      if (success) {
        setStops((prevStops) => prevStops.filter((stop) => stop.id !== stopId));
      }

      return success;
    } catch (error) {
      console.error("Error deleting stop:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStops = async () => {
    await loadStops();
  };

  return (
    <StopContext.Provider
      value={{
        stops,
        isLoading,
        currentTripId,
        setCurrentTripId,
        createStop,
        updateStop,
        deleteStop,
        refreshStops,
      }}
    >
      {children}
    </StopContext.Provider>
  );
}

export function useStops() {
  const context = useContext(StopContext);
  if (context === undefined) {
    throw new Error("useStops must be used within a StopProvider");
  }
  return context;
}
