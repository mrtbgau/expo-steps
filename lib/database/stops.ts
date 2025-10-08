import { dbConnection } from "./connection";
import { Stop } from "./types";

class StopService {
  async createStop(
    tripId: number,
    name: string,
    startDate: string,
    endDate: string,
    latitude?: number,
    longitude?: number,
    imageUri?: string,
    notes?: string
  ): Promise<Stop | null> {
    const db = await dbConnection.init();
    if (!db) return null;

    try {
      if (!name || !startDate || !endDate) {
        throw new Error("Tous les champs obligatoires doivent être remplis");
      }

      const stops = await this.getStopsByTripId(tripId);
      const orderIndex = stops.length;

      const result = await db.runAsync(
        "INSERT INTO stops (trip_id, name, latitude, longitude, start_date, end_date, image_uri, notes, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          tripId,
          name,
          latitude || null,
          longitude || null,
          startDate,
          endDate,
          imageUri || null,
          notes || null,
          orderIndex,
        ]
      );

      const stop = await db.getFirstAsync<Stop>(
        "SELECT * FROM stops WHERE id = ?",
        [result.lastInsertRowId]
      );

      return stop;
    } catch (error) {
      console.error("Error creating stop:", error);
      throw new Error("Erreur lors de la création de l'étape");
    }
  }

  async getStopsByTripId(tripId: number): Promise<Stop[]> {
    const db = await dbConnection.init();
    if (!db) return [];

    try {
      const stops = await db.getAllAsync<Stop>(
        "SELECT * FROM stops WHERE trip_id = ? ORDER BY order_index ASC, start_date ASC",
        [tripId]
      );

      return stops;
    } catch (error) {
      console.error("Error getting stops:", error);
      return [];
    }
  }

  async getStopById(stopId: number): Promise<Stop | null> {
    const db = await dbConnection.init();
    if (!db) return null;

    try {
      const stop = await db.getFirstAsync<Stop>(
        "SELECT * FROM stops WHERE id = ?",
        [stopId]
      );

      return stop;
    } catch (error) {
      console.error("Error getting stop:", error);
      return null;
    }
  }

  async updateStop(
    stopId: number,
    name: string,
    startDate: string,
    endDate: string,
    latitude?: number,
    longitude?: number,
    imageUri?: string,
    notes?: string
  ): Promise<Stop | null> {
    const db = await dbConnection.init();
    if (!db) return null;

    try {
      if (!name || !startDate || !endDate) {
        throw new Error("Tous les champs obligatoires doivent être remplis");
      }

      await db.runAsync(
        "UPDATE stops SET name = ?, latitude = ?, longitude = ?, start_date = ?, end_date = ?, image_uri = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [
          name,
          latitude || null,
          longitude || null,
          startDate,
          endDate,
          imageUri || null,
          notes || null,
          stopId,
        ]
      );

      const stop = await db.getFirstAsync<Stop>(
        "SELECT * FROM stops WHERE id = ?",
        [stopId]
      );

      return stop;
    } catch (error) {
      console.error("Error updating stop:", error);
      throw new Error("Erreur lors de la mise à jour de l'étape");
    }
  }

  async deleteStop(stopId: number): Promise<boolean> {
    const db = await dbConnection.init();
    if (!db) return false;

    try {
      const result = await db.runAsync("DELETE FROM stops WHERE id = ?", [
        stopId,
      ]);

      return result.changes > 0;
    } catch (error) {
      console.error("Error deleting stop:", error);
      throw error;
    }
  }
}

export const stopService = new StopService();
