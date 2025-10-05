import { dbConnection } from "./connection";
import { Trip } from "./types";

class TripService {
  async createTrip(
    userId: number,
    title: string,
    startDate: string,
    endDate: string,
    imageUri: string | null,
    notes?: string
  ): Promise<Trip | null> {
    const db = await dbConnection.init();
    if (!db) return null;

    try {
      if (!title || !startDate || !endDate) {
        throw new Error("Tous les champs obligatoires doivent être remplis");
      }

      const result = await db.runAsync(
        "INSERT INTO trips (user_id, title, start_date, end_date, image_uri, notes) VALUES (?, ?, ?, ?, ?, ?)",
        [userId, title, startDate, endDate, imageUri, notes || null]
      );

      const trip = await db.getFirstAsync<Trip>(
        "SELECT * FROM trips WHERE id = ?",
        [result.lastInsertRowId]
      );

      return trip;
    } catch (error) {
      console.error("Error creating trip:", error);
      throw new Error("Erreur lors de la création du voyage");
    }
  }

  async getTrips(userId: number): Promise<Trip[]> {
    const db = await dbConnection.init();
    if (!db) return [];

    try {
      const trips = await db.getAllAsync<Trip>(
        "SELECT * FROM trips WHERE user_id = ? ORDER BY start_date DESC",
        [userId]
      );

      return trips;
    } catch (error) {
      console.error("Error getting trips:", error);
      return [];
    }
  }

  async updateTrip(
    tripId: number,
    title: string,
    startDate: string,
    endDate: string,
    imageUri: string | null,
    notes?: string
  ): Promise<Trip | null> {
    const db = await dbConnection.init();
    if (!db) return null;

    try {
      if (!title || !startDate || !endDate) {
        throw new Error("Tous les champs obligatoires doivent être remplis");
      }

      await db.runAsync(
        "UPDATE trips SET title = ?, start_date = ?, end_date = ?, image_uri = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [title, startDate, endDate, imageUri, notes || null, tripId]
      );

      const trip = await db.getFirstAsync<Trip>(
        "SELECT * FROM trips WHERE id = ?",
        [tripId]
      );

      return trip;
    } catch (error) {
      console.error("Error updating trip:", error);
      throw new Error("Erreur lors de la mise à jour du voyage");
    }
  }

  async deleteTrip(tripId: number): Promise<boolean> {
    const db = await dbConnection.init();
    if (!db) return false;

    try {
      const result = await db.runAsync("DELETE FROM trips WHERE id = ?", [
        tripId,
      ]);

      return result.changes > 0;
    } catch (error) {
      console.error("Error deleting trip:", error);
      throw error;
    }
  }
}

export const tripService = new TripService();
