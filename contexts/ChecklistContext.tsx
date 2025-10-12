import React, { createContext, useContext, useEffect, useState } from "react";
import {
  ChecklistCategory,
  ChecklistItem,
  checklistService,
} from "../lib/database";

interface ChecklistContextType {
  categories: ChecklistCategory[];
  items: Map<number, ChecklistItem[]>;
  isLoading: boolean;
  currentTripId: number | null;
  setCurrentTripId: (tripId: number | null) => void;
  createCategory: (tripId: number, name: string, icon: string) => Promise<ChecklistCategory | null>;
  updateCategory: (categoryId: number, name: string, icon: string) => Promise<ChecklistCategory | null>;
  deleteCategory: (categoryId: number) => Promise<boolean>;
  createItem: (categoryId: number, name: string) => Promise<ChecklistItem | null>;
  updateItem: (itemId: number, name: string) => Promise<ChecklistItem | null>;
  toggleItemCheck: (itemId: number) => Promise<ChecklistItem | null>;
  deleteItem: (itemId: number) => Promise<boolean>;
  refreshChecklist: () => Promise<void>;
  getCategoryProgress: (categoryId: number) => { completed: number; total: number };
}

const ChecklistContext = createContext<ChecklistContextType | undefined>(
  undefined
);

export function ChecklistProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<ChecklistCategory[]>([]);
  const [items, setItems] = useState<Map<number, ChecklistItem[]>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [currentTripId, setCurrentTripId] = useState<number | null>(null);

  const loadChecklist = React.useCallback(async () => {
    if (!currentTripId) return;

    setIsLoading(true);
    try {
      const tripCategories = await checklistService.getCategoriesByTrip(
        currentTripId
      );
      setCategories(tripCategories);

      const itemsMap = new Map<number, ChecklistItem[]>();
      for (const category of tripCategories) {
        const categoryItems = await checklistService.getItemsByCategory(
          category.id
        );
        itemsMap.set(category.id, categoryItems);
      }
      setItems(itemsMap);
    } catch (error) {
      console.error("Error loading checklist:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentTripId]);

  useEffect(() => {
    if (currentTripId) {
      loadChecklist();
    } else {
      setCategories([]);
      setItems(new Map());
    }
  }, [currentTripId, loadChecklist]);

  const createCategory = async (
    tripId: number,
    name: string,
    icon: string
  ): Promise<ChecklistCategory | null> => {
    setIsLoading(true);
    try {
      const newCategory = await checklistService.createCategory(
        tripId,
        name,
        icon
      );

      if (newCategory && currentTripId === tripId) {
        setCategories((prevCategories) => [...prevCategories, newCategory]);
        setItems((prev) => {
          const newMap = new Map(prev);
          newMap.set(newCategory.id, []);
          return newMap;
        });
      }

      return newCategory;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCategory = async (
    categoryId: number,
    name: string,
    icon: string
  ): Promise<ChecklistCategory | null> => {
    setIsLoading(true);
    try {
      const updatedCategory = await checklistService.updateCategory(
        categoryId,
        name,
        icon
      );

      if (updatedCategory) {
        setCategories((prevCategories) =>
          prevCategories.map((cat) =>
            cat.id === categoryId ? updatedCategory : cat
          )
        );
      }

      return updatedCategory;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCategory = async (categoryId: number): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await checklistService.deleteCategory(categoryId);

      if (success) {
        setCategories((prevCategories) =>
          prevCategories.filter((cat) => cat.id !== categoryId)
        );

        setItems((prev) => {
          const newMap = new Map(prev);
          newMap.delete(categoryId);
          return newMap;
        });
      }

      return success;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createItem = async (
    categoryId: number,
    name: string
  ): Promise<ChecklistItem | null> => {
    try {
      const newItem = await checklistService.createItem(categoryId, name);

      if (newItem) {
        setItems((prev) => {
          const newMap = new Map(prev);
          const existing = newMap.get(categoryId) || [];
          newMap.set(categoryId, [...existing, newItem]);
          return newMap;
        });
      }

      return newItem;
    } catch (error) {
      console.error("Error creating item:", error);
      throw error;
    }
  };

  const updateItem = async (
    itemId: number,
    name: string
  ): Promise<ChecklistItem | null> => {
    try {
      const updatedItem = await checklistService.updateItem(itemId, name);

      if (updatedItem) {
        setItems((prev) => {
          const newMap = new Map(prev);
          newMap.forEach((itemList, categoryId) => {
            const updated = itemList.map((item) =>
              item.id === itemId ? updatedItem : item
            );
            newMap.set(categoryId, updated);
          });
          return newMap;
        });
      }

      return updatedItem;
    } catch (error) {
      console.error("Error updating item:", error);
      throw error;
    }
  };

  const toggleItemCheck = async (
    itemId: number
  ): Promise<ChecklistItem | null> => {
    try {
      const updatedItem = await checklistService.toggleItemCheck(itemId);

      if (updatedItem) {
        setItems((prev) => {
          const newMap = new Map(prev);
          newMap.forEach((itemList, categoryId) => {
            const updated = itemList.map((item) =>
              item.id === itemId ? updatedItem : item
            );
            newMap.set(categoryId, updated);
          });
          return newMap;
        });
      }

      return updatedItem;
    } catch (error) {
      console.error("Error toggling item:", error);
      throw error;
    }
  };

  const deleteItem = async (itemId: number): Promise<boolean> => {
    try {
      const success = await checklistService.deleteItem(itemId);

      if (success) {
        setItems((prev) => {
          const newMap = new Map(prev);
          newMap.forEach((itemList, categoryId) => {
            const filtered = itemList.filter((item) => item.id !== itemId);
            newMap.set(categoryId, filtered);
          });
          return newMap;
        });
      }

      return success;
    } catch (error) {
      console.error("Error deleting item:", error);
      throw error;
    }
  };

  const getCategoryProgress = (
    categoryId: number
  ): { completed: number; total: number } => {
    const categoryItems = items.get(categoryId) || [];
    const completed = categoryItems.filter((item) => item.is_checked === 1).length;
    const total = categoryItems.length;
    return { completed, total };
  };

  const refreshChecklist = async () => {
    await loadChecklist();
  };

  return (
    <ChecklistContext.Provider
      value={{
        categories,
        items,
        isLoading,
        currentTripId,
        setCurrentTripId,
        createCategory,
        updateCategory,
        deleteCategory,
        createItem,
        updateItem,
        toggleItemCheck,
        deleteItem,
        refreshChecklist,
        getCategoryProgress,
      }}
    >
      {children}
    </ChecklistContext.Provider>
  );
}

export function useChecklist() {
  const context = useContext(ChecklistContext);
  if (context === undefined) {
    throw new Error("useChecklist must be used within a ChecklistProvider");
  }
  return context;
}
