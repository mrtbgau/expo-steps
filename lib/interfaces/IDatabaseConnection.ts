import * as SQLite from "expo-sqlite";

export interface IDatabaseConnection {
  init(): Promise<SQLite.SQLiteDatabase | null>;
  getDb(): SQLite.SQLiteDatabase | null;
}
