import bcrypt from "bcryptjs";
import * as SQLite from "expo-sqlite";

bcrypt.setRandomFallback((len: number) => {
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes);
});

export interface User {
  id: number;
  email: string;
  password?: string;
  created_at: string;
}

export interface Trip {
  id: number;
  user_id: number;
  title: string;
  start_date: string;
  end_date: string;
  image_uri: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init() {
    if (!this.db) {
      this.db = await SQLite.openDatabaseAsync("tripFlow.db");
      await this.createTables();
    }
    return this.db;
  }

  private async createTables() {
    if (!this.db) return;

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS trips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        image_uri TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );
    `);
  }

  async createUser(email: string, password: string): Promise<User | null> {
    await this.init();
    if (!this.db) return null;

    console.log("=== DEBUG createUser ===");
    console.log("email type:", typeof email, "value:", email);
    console.log("password type:", typeof password, "length:", password?.length);

    try {
      if (!email || typeof email !== "string") {
        throw new Error("Email invalide");
      }

      if (!password || typeof password !== "string") {
        throw new Error("Mot de passe invalide");
      }

      if (password.length < 6) {
        throw new Error("Le mot de passe doit contenir au moins 6 caractères");
      }

      const normalizedEmail = email.toLowerCase().trim();

      const existingUser = await this.getUserByEmail(normalizedEmail);
      if (existingUser) {
        throw new Error("Un compte avec cet email existe déjà");
      }

      console.log("Hashing password...");
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);
      console.log("Password hashed successfully");

      const result = await this.db.runAsync(
        "INSERT INTO users (email, password) VALUES (?, ?)",
        [normalizedEmail, hashedPassword]
      );

      const user = await this.db.getFirstAsync<User>(
        "SELECT id, email, created_at FROM users WHERE id = ?",
        [result.lastInsertRowId]
      );

      console.log("User created successfully:", user?.id);
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erreur lors de la création du compte");
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    await this.init();
    if (!this.db) return null;

    if (!email || typeof email !== "string") return null;

    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.db.getFirstAsync<User>(
      "SELECT * FROM users WHERE email = ?",
      [normalizedEmail]
    );

    return user;
  }

  async verifyPassword(email: string, password: string): Promise<User | null> {
    console.log("=== DEBUG verifyPassword ===");
    console.log("email:", email, typeof email);
    console.log("password:", password ? "***" : "EMPTY", typeof password);

    if (!email || !password) {
      throw new Error("Email et mot de passe sont requis");
    }

    if (typeof email !== "string" || typeof password !== "string") {
      throw new Error("Email et mot de passe invalides");
    }

    const user = await this.getUserByEmail(email);
    if (!user || !user.password) {
      throw new Error("Email ou mot de passe invalide");
    }

    console.log("Comparing passwords...");
    const isValid = bcrypt.compareSync(password, user.password);
    console.log("Password comparison result:", isValid);

    if (!isValid) {
      throw new Error("Email ou mot de passe invalide");
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async deleteUser(email: string): Promise<boolean> {
    await this.init();
    if (!this.db) return false;

    if (!email || typeof email !== "string") {
      throw new Error("Email invalide");
    }

    try {
      const normalizedEmail = email.toLowerCase().trim();

      const user = await this.getUserByEmail(normalizedEmail);
      if (!user) {
        throw new Error("Utilisateur introuvable");
      }

      const result = await this.db.runAsync(
        "DELETE FROM users WHERE email = ?",
        [normalizedEmail]
      );

      return result.changes > 0;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  async createTrip(
    userId: number,
    title: string,
    startDate: string,
    endDate: string,
    imageUri: string | null,
    notes?: string
  ): Promise<Trip | null> {
    await this.init();
    if (!this.db) return null;

    try {
      if (!title || !startDate || !endDate) {
        throw new Error("Tous les champs obligatoires doivent être remplis");
      }

      const result = await this.db.runAsync(
        "INSERT INTO trips (user_id, title, start_date, end_date, image_uri, notes) VALUES (?, ?, ?, ?, ?, ?)",
        [userId, title, startDate, endDate, imageUri, notes || null]
      );

      const trip = await this.db.getFirstAsync<Trip>(
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
    await this.init();
    if (!this.db) return [];

    try {
      const trips = await this.db.getAllAsync<Trip>(
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
    await this.init();
    if (!this.db) return null;

    try {
      if (!title || !startDate || !endDate) {
        throw new Error("Tous les champs obligatoires doivent être remplis");
      }

      await this.db.runAsync(
        "UPDATE trips SET title = ?, start_date = ?, end_date = ?, image_uri = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [title, startDate, endDate, imageUri, notes || null, tripId]
      );

      const trip = await this.db.getFirstAsync<Trip>(
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
    await this.init();
    if (!this.db) return false;

    try {
      const result = await this.db.runAsync("DELETE FROM trips WHERE id = ?", [
        tripId,
      ]);

      return result.changes > 0;
    } catch (error) {
      console.error("Error deleting trip:", error);
      throw error;
    }
  }
}

export const databaseService = new DatabaseService();
