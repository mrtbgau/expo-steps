import React, { createContext, useContext, useEffect, useState } from "react";
import {
  TripShare,
  TripCollaborator,
  sharingService,
} from "../lib/database";

interface SharingContextType {
  shares: TripShare[];
  collaborators: TripCollaborator[];
  isLoading: boolean;
  currentTripId: number | null;
  setCurrentTripId: (tripId: number | null) => void;
  createShare: (
    tripId: number,
    userId: number,
    shareType: "read-only" | "collaborator",
    expiresAt?: string
  ) => Promise<TripShare | null>;
  revokeShare: (shareId: number) => Promise<boolean>;
  deleteShare: (shareId: number) => Promise<boolean>;
  addCollaborator: (
    tripId: number,
    email: string,
    role: "owner" | "editor" | "viewer"
  ) => Promise<TripCollaborator | null>;
  updateCollaboratorStatus: (
    collaboratorId: number,
    status: "accepted" | "declined"
  ) => Promise<TripCollaborator | null>;
  deleteCollaborator: (collaboratorId: number) => Promise<boolean>;
  refreshSharing: () => Promise<void>;
}

const SharingContext = createContext<SharingContextType | undefined>(undefined);

export function SharingProvider({ children }: { children: React.ReactNode }) {
  const [shares, setShares] = useState<TripShare[]>([]);
  const [collaborators, setCollaborators] = useState<TripCollaborator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTripId, setCurrentTripId] = useState<number | null>(null);

  const loadSharing = React.useCallback(async () => {
    if (!currentTripId) return;

    setIsLoading(true);
    try {
      const tripShares = await sharingService.getSharesByTrip(currentTripId);
      const tripCollaborators = await sharingService.getCollaboratorsByTrip(
        currentTripId
      );

      setShares(tripShares);
      setCollaborators(tripCollaborators);
    } catch (error) {
      console.error("Error loading sharing data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentTripId]);

  useEffect(() => {
    if (currentTripId) {
      loadSharing();
    } else {
      setShares([]);
      setCollaborators([]);
    }
  }, [currentTripId, loadSharing]);

  const createShare = async (
    tripId: number,
    userId: number,
    shareType: "read-only" | "collaborator",
    expiresAt?: string
  ): Promise<TripShare | null> => {
    setIsLoading(true);
    try {
      const newShare = await sharingService.createShare(
        tripId,
        userId,
        shareType,
        expiresAt
      );

      if (newShare && currentTripId === tripId) {
        setShares((prevShares) => [newShare, ...prevShares]);
      }

      return newShare;
    } catch (error) {
      console.error("Error creating share:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const revokeShare = async (shareId: number): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await sharingService.revokeShare(shareId);

      if (success) {
        setShares((prevShares) =>
          prevShares.map((share) =>
            share.id === shareId ? { ...share, is_active: 0 } : share
          )
        );
      }

      return success;
    } catch (error) {
      console.error("Error revoking share:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteShare = async (shareId: number): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await sharingService.deleteShare(shareId);

      if (success) {
        setShares((prevShares) =>
          prevShares.filter((share) => share.id !== shareId)
        );
      }

      return success;
    } catch (error) {
      console.error("Error deleting share:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addCollaborator = async (
    tripId: number,
    email: string,
    role: "owner" | "editor" | "viewer"
  ): Promise<TripCollaborator | null> => {
    setIsLoading(true);
    try {
      const newCollaborator = await sharingService.addCollaborator(
        tripId,
        email,
        role
      );

      if (newCollaborator && currentTripId === tripId) {
        setCollaborators((prevCollaborators) => [
          newCollaborator,
          ...prevCollaborators,
        ]);
      }

      return newCollaborator;
    } catch (error) {
      console.error("Error adding collaborator:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCollaboratorStatus = async (
    collaboratorId: number,
    status: "accepted" | "declined"
  ): Promise<TripCollaborator | null> => {
    setIsLoading(true);
    try {
      const updatedCollaborator =
        await sharingService.updateCollaboratorStatus(collaboratorId, status);

      if (updatedCollaborator) {
        setCollaborators((prevCollaborators) =>
          prevCollaborators.map((collab) =>
            collab.id === collaboratorId ? updatedCollaborator : collab
          )
        );
      }

      return updatedCollaborator;
    } catch (error) {
      console.error("Error updating collaborator status:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCollaborator = async (
    collaboratorId: number
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await sharingService.deleteCollaborator(collaboratorId);

      if (success) {
        setCollaborators((prevCollaborators) =>
          prevCollaborators.filter((collab) => collab.id !== collaboratorId)
        );
      }

      return success;
    } catch (error) {
      console.error("Error deleting collaborator:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSharing = async () => {
    await loadSharing();
  };

  return (
    <SharingContext.Provider
      value={{
        shares,
        collaborators,
        isLoading,
        currentTripId,
        setCurrentTripId,
        createShare,
        revokeShare,
        deleteShare,
        addCollaborator,
        updateCollaboratorStatus,
        deleteCollaborator,
        refreshSharing,
      }}
    >
      {children}
    </SharingContext.Provider>
  );
}

export function useSharing() {
  const context = useContext(SharingContext);
  if (context === undefined) {
    throw new Error("useSharing must be used within a SharingProvider");
  }
  return context;
}
