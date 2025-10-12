import { dbConnection } from "./connection";
import { TripShare, TripCollaborator } from "./types";

function generateShareToken(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
}

class SharingService {
  async createShare(
    tripId: number,
    userId: number,
    shareType: "read-only" | "collaborator",
    expiresAt?: string
  ): Promise<TripShare | null> {
    const db = await dbConnection.init();
    if (!db) return null;

    try {
      const shareToken = generateShareToken();

      const result = await db.runAsync(
        "INSERT INTO trip_shares (trip_id, shared_by_user_id, share_token, share_type, expires_at) VALUES (?, ?, ?, ?, ?)",
        [tripId, userId, shareToken, shareType, expiresAt || null]
      );

      const share = await db.getFirstAsync<TripShare>(
        "SELECT * FROM trip_shares WHERE id = ?",
        [result.lastInsertRowId]
      );

      return share;
    } catch (error) {
      console.error("Error creating share:", error);
      throw new Error("Erreur lors de la création du partage");
    }
  }

  async getSharesByTrip(tripId: number): Promise<TripShare[]> {
    const db = await dbConnection.init();
    if (!db) return [];

    try {
      const shares = await db.getAllAsync<TripShare>(
        "SELECT * FROM trip_shares WHERE trip_id = ? AND is_active = 1 ORDER BY created_at DESC",
        [tripId]
      );

      return shares;
    } catch (error) {
      console.error("Error getting shares:", error);
      return [];
    }
  }

  async getShareByToken(token: string): Promise<TripShare | null> {
    const db = await dbConnection.init();
    if (!db) return null;

    try {
      const share = await db.getFirstAsync<TripShare>(
        "SELECT * FROM trip_shares WHERE share_token = ? AND is_active = 1",
        [token]
      );

      return share;
    } catch (error) {
      console.error("Error getting share by token:", error);
      return null;
    }
  }

  async revokeShare(shareId: number): Promise<boolean> {
    const db = await dbConnection.init();
    if (!db) return false;

    try {
      const result = await db.runAsync(
        "UPDATE trip_shares SET is_active = 0 WHERE id = ?",
        [shareId]
      );

      return result.changes > 0;
    } catch (error) {
      console.error("Error revoking share:", error);
      throw error;
    }
  }

  async deleteShare(shareId: number): Promise<boolean> {
    const db = await dbConnection.init();
    if (!db) return false;

    try {
      const result = await db.runAsync(
        "DELETE FROM trip_shares WHERE id = ?",
        [shareId]
      );

      return result.changes > 0;
    } catch (error) {
      console.error("Error deleting share:", error);
      throw error;
    }
  }

  async addCollaborator(
    tripId: number,
    email: string,
    role: "owner" | "editor" | "viewer"
  ): Promise<TripCollaborator | null> {
    const db = await dbConnection.init();
    if (!db) return null;

    try {
      if (!email || !email.includes("@")) {
        throw new Error("Email invalide");
      }

      const existingCollaborator = await db.getFirstAsync<TripCollaborator>(
        "SELECT * FROM trip_collaborators WHERE trip_id = ? AND user_email = ?",
        [tripId, email.toLowerCase()]
      );

      if (existingCollaborator) {
        throw new Error("Cet utilisateur est déjà invité");
      }

      const result = await db.runAsync(
        "INSERT INTO trip_collaborators (trip_id, user_email, role, status) VALUES (?, ?, ?, ?)",
        [tripId, email.toLowerCase(), role, "pending"]
      );

      const collaborator = await db.getFirstAsync<TripCollaborator>(
        "SELECT * FROM trip_collaborators WHERE id = ?",
        [result.lastInsertRowId]
      );

      return collaborator;
    } catch (error) {
      console.error("Error adding collaborator:", error);
      throw error;
    }
  }

  async getCollaboratorsByTrip(tripId: number): Promise<TripCollaborator[]> {
    const db = await dbConnection.init();
    if (!db) return [];

    try {
      const collaborators = await db.getAllAsync<TripCollaborator>(
        "SELECT * FROM trip_collaborators WHERE trip_id = ? ORDER BY invited_at DESC",
        [tripId]
      );

      return collaborators;
    } catch (error) {
      console.error("Error getting collaborators:", error);
      return [];
    }
  }

  async updateCollaboratorStatus(
    collaboratorId: number,
    status: "accepted" | "declined"
  ): Promise<TripCollaborator | null> {
    const db = await dbConnection.init();
    if (!db) return null;

    try {
      const acceptedAt = status === "accepted" ? new Date().toISOString() : null;

      await db.runAsync(
        "UPDATE trip_collaborators SET status = ?, accepted_at = ? WHERE id = ?",
        [status, acceptedAt, collaboratorId]
      );

      const collaborator = await db.getFirstAsync<TripCollaborator>(
        "SELECT * FROM trip_collaborators WHERE id = ?",
        [collaboratorId]
      );

      return collaborator;
    } catch (error) {
      console.error("Error updating collaborator status:", error);
      throw new Error("Erreur lors de la mise à jour du statut");
    }
  }

  async deleteCollaborator(collaboratorId: number): Promise<boolean> {
    const db = await dbConnection.init();
    if (!db) return false;

    try {
      const result = await db.runAsync(
        "DELETE FROM trip_collaborators WHERE id = ?",
        [collaboratorId]
      );

      return result.changes > 0;
    } catch (error) {
      console.error("Error deleting collaborator:", error);
      throw error;
    }
  }
}

export const sharingService = new SharingService();
