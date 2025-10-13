import { ITripService } from "../interfaces/ITripService";
import { IDatabaseConnection } from "../interfaces/IDatabaseConnection";
import { TripValidator } from "../utils/validators";
import { Trip } from "./types";

class TripService implements ITripService {
  constructor(private dbConnection: IDatabaseConnection) {}

  async createTrip(
    userId: number,
    title: string,
    startDate: string,
    endDate: string,
    imageUri: string | null,
    notes?: string
  ): Promise<Trip | null> {
    const db = await this.dbConnection.init();
    if (!db) return null;

    try {
      this.validateTripData(title, startDate, endDate);

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
    const db = await this.dbConnection.init();
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
    const db = await this.dbConnection.init();
    if (!db) return null;

    try {
      this.validateTripData(title, startDate, endDate);

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
    const db = await this.dbConnection.init();
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

  private validateTripData(title: string, startDate: string, endDate: string): void {
    if (!title || !startDate || !endDate) {
      throw new Error("Tous les champs obligatoires doivent être remplis");
    }

    const titleError = TripValidator.validateTitle(title);
    if (titleError) {
      throw new Error(titleError);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const dateErrors = TripValidator.validateDates(start, end);

    if (dateErrors.startDate) {
      throw new Error(dateErrors.startDate);
    }

    if (dateErrors.endDate) {
      throw new Error(dateErrors.endDate);
    }
  }
}

export { TripService };
