import { dbConnection } from "./connection";
import { JournalEntry, JournalPhoto } from "./types";

class JournalService {
  async createEntry(
    tripId: number,
    entryDate: string,
    title: string,
    content?: string,
    stopId?: number,
    audioUri?: string
  ): Promise<JournalEntry | null> {
    const db = await dbConnection.init();
    if (!db) return null;

    try {
      if (!title || !entryDate) {
        throw new Error("Le titre et la date sont requis");
      }

      const result = await db.runAsync(
        "INSERT INTO journal_entries (trip_id, stop_id, entry_date, title, content, audio_uri) VALUES (?, ?, ?, ?, ?, ?)",
        [tripId, stopId || null, entryDate, title, content || null, audioUri || null]
      );

      const entry = await db.getFirstAsync<JournalEntry>(
        "SELECT * FROM journal_entries WHERE id = ?",
        [result.lastInsertRowId]
      );

      return entry;
    } catch (error) {
      console.error("Error creating journal entry:", error);
      throw new Error("Erreur lors de la création de l'entrée");
    }
  }

  async getEntriesByTrip(tripId: number): Promise<JournalEntry[]> {
    const db = await dbConnection.init();
    if (!db) return [];

    try {
      const entries = await db.getAllAsync<JournalEntry>(
        "SELECT * FROM journal_entries WHERE trip_id = ? ORDER BY entry_date DESC, created_at DESC",
        [tripId]
      );

      return entries;
    } catch (error) {
      console.error("Error getting journal entries:", error);
      return [];
    }
  }

  async getEntriesByStop(stopId: number): Promise<JournalEntry[]> {
    const db = await dbConnection.init();
    if (!db) return [];

    try {
      const entries = await db.getAllAsync<JournalEntry>(
        "SELECT * FROM journal_entries WHERE stop_id = ? ORDER BY entry_date DESC, created_at DESC",
        [stopId]
      );

      return entries;
    } catch (error) {
      console.error("Error getting journal entries by stop:", error);
      return [];
    }
  }

  async getEntryById(entryId: number): Promise<JournalEntry | null> {
    const db = await dbConnection.init();
    if (!db) return null;

    try {
      const entry = await db.getFirstAsync<JournalEntry>(
        "SELECT * FROM journal_entries WHERE id = ?",
        [entryId]
      );

      return entry;
    } catch (error) {
      console.error("Error getting journal entry:", error);
      return null;
    }
  }

  async updateEntry(
    entryId: number,
    entryDate: string,
    title: string,
    content?: string,
    stopId?: number,
    audioUri?: string
  ): Promise<JournalEntry | null> {
    const db = await dbConnection.init();
    if (!db) return null;

    try {
      if (!title || !entryDate) {
        throw new Error("Le titre et la date sont requis");
      }

      await db.runAsync(
        "UPDATE journal_entries SET entry_date = ?, title = ?, content = ?, stop_id = ?, audio_uri = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [entryDate, title, content || null, stopId || null, audioUri || null, entryId]
      );

      const entry = await db.getFirstAsync<JournalEntry>(
        "SELECT * FROM journal_entries WHERE id = ?",
        [entryId]
      );

      return entry;
    } catch (error) {
      console.error("Error updating journal entry:", error);
      throw new Error("Erreur lors de la mise à jour de l'entrée");
    }
  }

  async deleteEntry(entryId: number): Promise<boolean> {
    const db = await dbConnection.init();
    if (!db) return false;

    try {
      const result = await db.runAsync(
        "DELETE FROM journal_entries WHERE id = ?",
        [entryId]
      );

      return result.changes > 0;
    } catch (error) {
      console.error("Error deleting journal entry:", error);
      throw error;
    }
  }

  async addPhotosToEntry(
    entryId: number,
    photos: { imageUri: string; caption?: string }[]
  ): Promise<JournalPhoto[]> {
    const db = await dbConnection.init();
    if (!db) return [];

    try {
      const createdPhotos: JournalPhoto[] = [];

      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        const result = await db.runAsync(
          "INSERT INTO journal_photos (entry_id, image_uri, caption, order_index) VALUES (?, ?, ?, ?)",
          [entryId, photo.imageUri, photo.caption || null, i]
        );

        const createdPhoto = await db.getFirstAsync<JournalPhoto>(
          "SELECT * FROM journal_photos WHERE id = ?",
          [result.lastInsertRowId]
        );

        if (createdPhoto) {
          createdPhotos.push(createdPhoto);
        }
      }

      return createdPhotos;
    } catch (error) {
      console.error("Error adding photos to entry:", error);
      throw new Error("Erreur lors de l'ajout des photos");
    }
  }

  async getPhotosByEntry(entryId: number): Promise<JournalPhoto[]> {
    const db = await dbConnection.init();
    if (!db) return [];

    try {
      const photos = await db.getAllAsync<JournalPhoto>(
        "SELECT * FROM journal_photos WHERE entry_id = ? ORDER BY order_index ASC",
        [entryId]
      );

      return photos;
    } catch (error) {
      console.error("Error getting photos:", error);
      return [];
    }
  }

  async removePhotoFromEntry(photoId: number): Promise<boolean> {
    const db = await dbConnection.init();
    if (!db) return false;

    try {
      const result = await db.runAsync(
        "DELETE FROM journal_photos WHERE id = ?",
        [photoId]
      );

      return result.changes > 0;
    } catch (error) {
      console.error("Error removing photo:", error);
      throw error;
    }
  }
}

export const journalService = new JournalService();
