import * as SQLite from "expo-sqlite";
import { IDatabaseConnection } from "../interfaces/IDatabaseConnection";
import { DatabaseSchema } from "./schema";

class DatabaseConnection implements IDatabaseConnection {
  private db: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<SQLite.SQLiteDatabase | null> {
    if (!this.db) {
      this.db = await SQLite.openDatabaseAsync("tripFlow.db");
      await DatabaseSchema.createTables(this.db);
    }
    return this.db;
  }

  getDb(): SQLite.SQLiteDatabase | null {
    return this.db;
  }
}

export const dbConnection = new DatabaseConnection();
