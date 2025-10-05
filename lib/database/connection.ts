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
    `);
  }

  getDb() {
    return this.db;
  }
}

export const dbConnection = new DatabaseConnection();
