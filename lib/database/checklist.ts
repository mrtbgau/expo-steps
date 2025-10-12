import { dbConnection } from "./connection";
import { ChecklistCategory, ChecklistItem, ChecklistReminder } from "./types";

class ChecklistService {
  async createCategory(
    tripId: number,
    name: string,
    icon: string
  ): Promise<ChecklistCategory | null> {
    const db = await dbConnection.init();
    if (!db) return null;

    try {
      if (!name || !icon) {
        throw new Error("Le nom et l'icône sont requis");
      }

      const categories = await this.getCategoriesByTrip(tripId);
      const orderIndex = categories.length;

      const result = await db.runAsync(
        "INSERT INTO checklist_categories (trip_id, name, icon, order_index) VALUES (?, ?, ?, ?)",
        [tripId, name, icon, orderIndex]
      );

      const category = await db.getFirstAsync<ChecklistCategory>(
        "SELECT * FROM checklist_categories WHERE id = ?",
        [result.lastInsertRowId]
      );

      return category;
    } catch (error) {
      console.error("Error creating checklist category:", error);
      throw new Error("Erreur lors de la création de la catégorie");
    }
  }

  async getCategoriesByTrip(tripId: number): Promise<ChecklistCategory[]> {
    const db = await dbConnection.init();
    if (!db) return [];

    try {
      const categories = await db.getAllAsync<ChecklistCategory>(
        "SELECT * FROM checklist_categories WHERE trip_id = ? ORDER BY order_index ASC",
        [tripId]
      );

      return categories;
    } catch (error) {
      console.error("Error getting checklist categories:", error);
      return [];
    }
  }

  async updateCategory(
    categoryId: number,
    name: string,
    icon: string
  ): Promise<ChecklistCategory | null> {
    const db = await dbConnection.init();
    if (!db) return null;

    try {
      if (!name || !icon) {
        throw new Error("Le nom et l'icône sont requis");
      }

      await db.runAsync(
        "UPDATE checklist_categories SET name = ?, icon = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [name, icon, categoryId]
      );

      const category = await db.getFirstAsync<ChecklistCategory>(
        "SELECT * FROM checklist_categories WHERE id = ?",
        [categoryId]
      );

      return category;
    } catch (error) {
      console.error("Error updating checklist category:", error);
      throw new Error("Erreur lors de la mise à jour de la catégorie");
    }
  }

  async deleteCategory(categoryId: number): Promise<boolean> {
    const db = await dbConnection.init();
    if (!db) return false;

    try {
      const result = await db.runAsync(
        "DELETE FROM checklist_categories WHERE id = ?",
        [categoryId]
      );

      return result.changes > 0;
    } catch (error) {
      console.error("Error deleting checklist category:", error);
      throw error;
    }
  }

  async createItem(
    categoryId: number,
    name: string
  ): Promise<ChecklistItem | null> {
    const db = await dbConnection.init();
    if (!db) return null;

    try {
      if (!name) {
        throw new Error("Le nom de l'article est requis");
      }

      const items = await this.getItemsByCategory(categoryId);
      const orderIndex = items.length;

      const result = await db.runAsync(
        "INSERT INTO checklist_items (category_id, name, order_index) VALUES (?, ?, ?)",
        [categoryId, name, orderIndex]
      );

      const item = await db.getFirstAsync<ChecklistItem>(
        "SELECT * FROM checklist_items WHERE id = ?",
        [result.lastInsertRowId]
      );

      return item;
    } catch (error) {
      console.error("Error creating checklist item:", error);
      throw new Error("Erreur lors de la création de l'article");
    }
  }

  async getItemsByCategory(categoryId: number): Promise<ChecklistItem[]> {
    const db = await dbConnection.init();
    if (!db) return [];

    try {
      const items = await db.getAllAsync<ChecklistItem>(
        "SELECT * FROM checklist_items WHERE category_id = ? ORDER BY order_index ASC",
        [categoryId]
      );

      return items;
    } catch (error) {
      console.error("Error getting checklist items:", error);
      return [];
    }
  }

  async updateItem(
    itemId: number,
    name: string
  ): Promise<ChecklistItem | null> {
    const db = await dbConnection.init();
    if (!db) return null;

    try {
      if (!name) {
        throw new Error("Le nom de l'article est requis");
      }

      await db.runAsync(
        "UPDATE checklist_items SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [name, itemId]
      );

      const item = await db.getFirstAsync<ChecklistItem>(
        "SELECT * FROM checklist_items WHERE id = ?",
        [itemId]
      );

      return item;
    } catch (error) {
      console.error("Error updating checklist item:", error);
      throw new Error("Erreur lors de la mise à jour de l'article");
    }
  }

  async toggleItemCheck(itemId: number): Promise<ChecklistItem | null> {
    const db = await dbConnection.init();
    if (!db) return null;

    try {
      const item = await db.getFirstAsync<ChecklistItem>(
        "SELECT * FROM checklist_items WHERE id = ?",
        [itemId]
      );

      if (!item) {
        throw new Error("Article introuvable");
      }

      const newCheckedValue = item.is_checked === 1 ? 0 : 1;

      await db.runAsync(
        "UPDATE checklist_items SET is_checked = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [newCheckedValue, itemId]
      );

      const updatedItem = await db.getFirstAsync<ChecklistItem>(
        "SELECT * FROM checklist_items WHERE id = ?",
        [itemId]
      );

      return updatedItem;
    } catch (error) {
      console.error("Error toggling checklist item:", error);
      throw new Error("Erreur lors de la mise à jour de l'article");
    }
  }

  async deleteItem(itemId: number): Promise<boolean> {
    const db = await dbConnection.init();
    if (!db) return false;

    try {
      const result = await db.runAsync(
        "DELETE FROM checklist_items WHERE id = ?",
        [itemId]
      );

      return result.changes > 0;
    } catch (error) {
      console.error("Error deleting checklist item:", error);
      throw error;
    }
  }

  async createReminder(
    tripId: number,
    reminderDate: string,
    message: string
  ): Promise<ChecklistReminder | null> {
    const db = await dbConnection.init();
    if (!db) return null;

    try {
      if (!reminderDate || !message) {
        throw new Error("La date et le message sont requis");
      }

      const result = await db.runAsync(
        "INSERT INTO checklist_reminders (trip_id, reminder_date, message) VALUES (?, ?, ?)",
        [tripId, reminderDate, message]
      );

      const reminder = await db.getFirstAsync<ChecklistReminder>(
        "SELECT * FROM checklist_reminders WHERE id = ?",
        [result.lastInsertRowId]
      );

      return reminder;
    } catch (error) {
      console.error("Error creating checklist reminder:", error);
      throw new Error("Erreur lors de la création du rappel");
    }
  }

  async getRemindersByTrip(tripId: number): Promise<ChecklistReminder[]> {
    const db = await dbConnection.init();
    if (!db) return [];

    try {
      const reminders = await db.getAllAsync<ChecklistReminder>(
        "SELECT * FROM checklist_reminders WHERE trip_id = ? ORDER BY reminder_date ASC",
        [tripId]
      );

      return reminders;
    } catch (error) {
      console.error("Error getting checklist reminders:", error);
      return [];
    }
  }

  async deleteReminder(reminderId: number): Promise<boolean> {
    const db = await dbConnection.init();
    if (!db) return false;

    try {
      const result = await db.runAsync(
        "DELETE FROM checklist_reminders WHERE id = ?",
        [reminderId]
      );

      return result.changes > 0;
    } catch (error) {
      console.error("Error deleting checklist reminder:", error);
      throw error;
    }
  }
}

export const checklistService = new ChecklistService();
