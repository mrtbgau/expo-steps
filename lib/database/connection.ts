import * as SQLite from "expo-sqlite";

class DatabaseConnection {
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

      CREATE TABLE IF NOT EXISTS stops (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trip_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        description TEXT,
        image_uri TEXT,
        notes TEXT,
        order_index INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS journal_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trip_id INTEGER NOT NULL,
        stop_id INTEGER,
        entry_date TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT,
        audio_uri TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE,
        FOREIGN KEY (stop_id) REFERENCES stops (id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS journal_photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entry_id INTEGER NOT NULL,
        image_uri TEXT NOT NULL,
        caption TEXT,
        order_index INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (entry_id) REFERENCES journal_entries (id) ON DELETE CASCADE
      );
    `);
  }

  getDb() {
    return this.db;
  }
}

export const dbConnection = new DatabaseConnection();
