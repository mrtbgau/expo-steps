import React, { createContext, useContext, useEffect, useState } from "react";
import { JournalEntry, JournalPhoto, journalService } from "../lib/database";

interface JournalContextType {
  entries: JournalEntry[];
  photos: Map<number, JournalPhoto[]>;
  isLoading: boolean;
  currentTripId: number | null;
  filterByStop: number | null;
  setCurrentTripId: (tripId: number | null) => void;
  setFilterByStop: (stopId: number | null) => void;
  createEntry: (
    tripId: number,
    entryDate: Date,
    title: string,
    content?: string,
    stopId?: number,
    audioUri?: string,
    photos?: { imageUri: string; caption?: string }[]
  ) => Promise<JournalEntry | null>;
  updateEntry: (
    entryId: number,
    entryDate: Date,
    title: string,
    content?: string,
    stopId?: number,
    audioUri?: string
  ) => Promise<JournalEntry | null>;
  deleteEntry: (entryId: number) => Promise<boolean>;
  addPhotosToEntry: (
    entryId: number,
    photos: { imageUri: string; caption?: string }[]
  ) => Promise<JournalPhoto[]>;
  removePhotoFromEntry: (photoId: number) => Promise<boolean>;
  refreshEntries: () => Promise<void>;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export function JournalProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [photos, setPhotos] = useState<Map<number, JournalPhoto[]>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [currentTripId, setCurrentTripId] = useState<number | null>(null);
  const [filterByStop, setFilterByStop] = useState<number | null>(null);

  const loadEntries = React.useCallback(async () => {
    if (!currentTripId) return;

    setIsLoading(true);
    try {
      let tripEntries: JournalEntry[];

      if (filterByStop) {
        tripEntries = await journalService.getEntriesByStop(filterByStop);
      } else {
        tripEntries = await journalService.getEntriesByTrip(currentTripId);
      }

      setEntries(tripEntries);

      const photosMap = new Map<number, JournalPhoto[]>();
      for (const entry of tripEntries) {
        const entryPhotos = await journalService.getPhotosByEntry(entry.id);
        photosMap.set(entry.id, entryPhotos);
      }
      setPhotos(photosMap);
    } catch (error) {
      console.error("Error loading journal entries:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentTripId, filterByStop]);

  useEffect(() => {
    if (currentTripId) {
      loadEntries();
    } else {
      setEntries([]);
      setPhotos(new Map());
    }
  }, [currentTripId, filterByStop, loadEntries]);

  const createEntry = async (
    tripId: number,
    entryDate: Date,
    title: string,
    content?: string,
    stopId?: number,
    audioUri?: string,
    entryPhotos?: { imageUri: string; caption?: string }[]
  ): Promise<JournalEntry | null> => {
    setIsLoading(true);
    try {
      const newEntry = await journalService.createEntry(
        tripId,
        entryDate.toISOString(),
        title,
        content,
        stopId,
        audioUri
      );

      if (newEntry) {
        if (entryPhotos && entryPhotos.length > 0) {
          const createdPhotos = await journalService.addPhotosToEntry(
            newEntry.id,
            entryPhotos
          );

          setPhotos((prev) => {
            const newMap = new Map(prev);
            newMap.set(newEntry.id, createdPhotos);
            return newMap;
          });
        }

        if (currentTripId === tripId) {
          setEntries((prevEntries) => [newEntry, ...prevEntries]);
        }
      }

      return newEntry;
    } catch (error) {
      console.error("Error creating journal entry:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateEntry = async (
    entryId: number,
    entryDate: Date,
    title: string,
    content?: string,
    stopId?: number,
    audioUri?: string
  ): Promise<JournalEntry | null> => {
    setIsLoading(true);
    try {
      const updatedEntry = await journalService.updateEntry(
        entryId,
        entryDate.toISOString(),
        title,
        content,
        stopId,
        audioUri
      );

      if (updatedEntry) {
        setEntries((prevEntries) =>
          prevEntries.map((entry) =>
            entry.id === entryId ? updatedEntry : entry
          )
        );
      }

      return updatedEntry;
    } catch (error) {
      console.error("Error updating journal entry:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEntry = async (entryId: number): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await journalService.deleteEntry(entryId);

      if (success) {
        setEntries((prevEntries) =>
          prevEntries.filter((entry) => entry.id !== entryId)
        );

        setPhotos((prev) => {
          const newMap = new Map(prev);
          newMap.delete(entryId);
          return newMap;
        });
      }

      return success;
    } catch (error) {
      console.error("Error deleting journal entry:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addPhotosToEntry = async (
    entryId: number,
    entryPhotos: { imageUri: string; caption?: string }[]
  ): Promise<JournalPhoto[]> => {
    try {
      const createdPhotos = await journalService.addPhotosToEntry(
        entryId,
        entryPhotos
      );

      setPhotos((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(entryId) || [];
        newMap.set(entryId, [...existing, ...createdPhotos]);
        return newMap;
      });

      return createdPhotos;
    } catch (error) {
      console.error("Error adding photos to entry:", error);
      throw error;
    }
  };

  const removePhotoFromEntry = async (photoId: number): Promise<boolean> => {
    try {
      const success = await journalService.removePhotoFromEntry(photoId);

      if (success) {
        setPhotos((prev) => {
          const newMap = new Map(prev);
          newMap.forEach((photoList, entryId) => {
            const filtered = photoList.filter((photo) => photo.id !== photoId);
            newMap.set(entryId, filtered);
          });
          return newMap;
        });
      }

      return success;
    } catch (error) {
      console.error("Error removing photo from entry:", error);
      throw error;
    }
  };

  const refreshEntries = async () => {
    await loadEntries();
  };

  return (
    <JournalContext.Provider
      value={{
        entries,
        photos,
        isLoading,
        currentTripId,
        filterByStop,
        setCurrentTripId,
        setFilterByStop,
        createEntry,
        updateEntry,
        deleteEntry,
        addPhotosToEntry,
        removePhotoFromEntry,
        refreshEntries,
      }}
    >
      {children}
    </JournalContext.Provider>
  );
}

export function useJournal() {
  const context = useContext(JournalContext);
  if (context === undefined) {
    throw new Error("useJournal must be used within a JournalProvider");
  }
  return context;
}
