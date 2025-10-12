import AlertDialog from "@/components/AlertDialog";
import BottomModal from "@/components/BottomModal";
import Button from "@/components/Button";
import ChecklistCategoryCard from "@/components/checklist/ChecklistCategoryCard";
import ChecklistItemRow from "@/components/checklist/ChecklistItemRow";
import Dropdown, { DropdownOption } from "@/components/Dropdown";
import Header from "@/components/Header";
import Input from "@/components/Input";
import { useChecklist } from "@/contexts/ChecklistContext";
import { useTrips } from "@/contexts/TripContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DEFAULT_CATEGORIES = [
  { name: "Bagages", icon: "briefcase-outline" },
  { name: "Documents", icon: "document-text-outline" },
  { name: "Santé", icon: "medical-outline" },
  { name: "Électronique", icon: "phone-portrait-outline" },
];

const ICON_OPTIONS: DropdownOption[] = [
  { id: "briefcase-outline", label: "Valise", icon: "briefcase-outline" },
  { id: "document-text-outline", label: "Documents", icon: "document-text-outline" },
  { id: "medical-outline", label: "Santé", icon: "medical-outline" },
  { id: "phone-portrait-outline", label: "Électronique", icon: "phone-portrait-outline" },
  { id: "shirt-outline", label: "Vêtements", icon: "shirt-outline" },
  { id: "restaurant-outline", label: "Nourriture", icon: "restaurant-outline" },
  { id: "camera-outline", label: "Photo", icon: "camera-outline" },
  { id: "bag-handle-outline", label: "Sac", icon: "bag-handle-outline" },
];

export default function ChecklistScreen() {
  const router = useRouter();
  const { trips } = useTrips();
  const {
    categories,
    items,
    isLoading,
    setCurrentTripId,
    createCategory,
    deleteCategory,
    createItem,
    deleteItem,
    toggleItemCheck,
    getCategoryProgress,
  } = useChecklist();

  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(null);

  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isItemModalVisible, setIsItemModalVisible] = useState(false);
  const [isCategoryActionsModalVisible, setIsCategoryActionsModalVisible] = useState(false);
  const [isItemActionsModalVisible, setIsItemActionsModalVisible] = useState(false);

  const [categoryName, setCategoryName] = useState("");
  const [categoryIcon, setCategoryIcon] = useState<string>("briefcase-outline");
  const [itemName, setItemName] = useState("");

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  const [showDeleteCategoryDialog, setShowDeleteCategoryDialog] = useState(false);
  const [showDeleteItemDialog, setShowDeleteItemDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const tripOptions = useMemo<DropdownOption[]>(() => {
    return trips.map((trip) => ({
      id: trip.id,
      label: trip.title,
      icon: "briefcase-outline" as keyof typeof Ionicons.glyphMap,
    }));
  }, [trips]);

  useEffect(() => {
    if (trips.length > 0 && !selectedTripId) {
      const firstTrip = trips[0];
      setSelectedTripId(firstTrip.id);
      setCurrentTripId(firstTrip.id);
    }
  }, [trips, selectedTripId, setCurrentTripId]);

  const handleTripChange = (value: string | number) => {
    const tripId = value as number;
    setSelectedTripId(tripId);
    setCurrentTripId(tripId);
    setExpandedCategoryId(null);
  };

  const handleInitializeDefaultCategories = async () => {
    if (!selectedTripId) return;

    try {
      for (const category of DEFAULT_CATEGORIES) {
        await createCategory(selectedTripId, category.name, category.icon);
      }
      setSuccessMessage("Catégories par défaut créées !");
      setShowSuccessDialog(true);
    } catch {
      setErrorMessage("Erreur lors de la création des catégories");
      setShowErrorDialog(true);
    }
  };

  const handleCreateCategory = async () => {
    if (!selectedTripId || !categoryName.trim()) return;

    try {
      await createCategory(selectedTripId, categoryName, categoryIcon);
      setIsCategoryModalVisible(false);
      setCategoryName("");
      setCategoryIcon("briefcase-outline");
      setSuccessMessage("Catégorie créée !");
      setShowSuccessDialog(true);
    } catch {
      setErrorMessage("Erreur lors de la création de la catégorie");
      setShowErrorDialog(true);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;

    try {
      await deleteCategory(selectedCategory);
      setShowDeleteCategoryDialog(false);
      setIsCategoryActionsModalVisible(false);
      setSelectedCategory(null);
      setSuccessMessage("Catégorie supprimée !");
      setShowSuccessDialog(true);
    } catch {
      setErrorMessage("Erreur lors de la suppression de la catégorie");
      setShowErrorDialog(true);
    }
  };

  const handleCreateItem = async () => {
    if (!expandedCategoryId || !itemName.trim()) return;

    try {
      await createItem(expandedCategoryId, itemName);
      setIsItemModalVisible(false);
      setItemName("");
      setSuccessMessage("Article ajouté !");
      setShowSuccessDialog(true);
    } catch {
      setErrorMessage("Erreur lors de l'ajout de l'article");
      setShowErrorDialog(true);
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;

    try {
      await deleteItem(selectedItem);
      setShowDeleteItemDialog(false);
      setIsItemActionsModalVisible(false);
      setSelectedItem(null);
      setSuccessMessage("Article supprimé !");
      setShowSuccessDialog(true);
    } catch {
      setErrorMessage("Erreur lors de la suppression de l'article");
      setShowErrorDialog(true);
    }
  };

  const handleToggleItem = async (itemId: number) => {
    try {
      await toggleItemCheck(itemId);
    } catch {
      setErrorMessage("Erreur lors de la mise à jour");
      setShowErrorDialog(true);
    }
  };

  const renderCategory = ({ item }: { item: any }) => {
    const progress = getCategoryProgress(item.id);
    const isExpanded = expandedCategoryId === item.id;
    const categoryItems = items.get(item.id) || [];

    return (
      <View>
        <ChecklistCategoryCard
          name={item.name}
          icon={item.icon}
          completed={progress.completed}
          total={progress.total}
          onPress={() => setExpandedCategoryId(isExpanded ? null : item.id)}
          onLongPress={() => {
            setSelectedCategory(item.id);
            setIsCategoryActionsModalVisible(true);
          }}
        />

        {isExpanded && (
          <View style={styles.itemsContainer}>
            {categoryItems.map((categoryItem) => (
              <ChecklistItemRow
                key={categoryItem.id}
                name={categoryItem.name}
                isChecked={categoryItem.is_checked === 1}
                onToggle={() => handleToggleItem(categoryItem.id)}
                onLongPress={() => {
                  setSelectedItem(categoryItem.id);
                  setIsItemActionsModalVisible(true);
                }}
              />
            ))}

            <TouchableOpacity
              style={styles.addItemButton}
              onPress={() => setIsItemModalVisible(true)}
            >
              <Ionicons name="add-circle-outline" size={20} color="#1dd1a1" />
              <Text style={styles.addItemText}>Ajouter un article</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#1dd1a1" />
          <Text style={styles.emptyText}>Chargement...</Text>
        </View>
      );
    }

    if (!selectedTripId) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-done-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>Aucun voyage</Text>
          <Text style={styles.emptyText}>
            Créez un voyage pour commencer votre checklist
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="list-outline" size={64} color="#d1d5db" />
        <Text style={styles.emptyTitle}>Aucune catégorie</Text>
        <Text style={styles.emptyText}>
          Créez des catégories pour organiser votre checklist
        </Text>
        <Button
          label="Créer les catégories par défaut"
          onPress={handleInitializeDefaultCategories}
          variant="btnPrimary"
          color="white"
          style={{ marginTop: 16 }}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Checklist de préparation"
        onPress={() => router.back()}
        icon="arrow-back"
        iconPosition="left"
      />

      {tripOptions.length > 0 && (
        <View style={styles.tripSelectorContainer}>
          <Dropdown
            value={selectedTripId || ""}
            options={tripOptions}
            onChange={handleTripChange}
          />
        </View>
      )}

      {categories.length > 0 && selectedTripId && (
        <View style={styles.addCategoryButtonContainer}>
          <TouchableOpacity
            style={styles.addCategoryButton}
            onPress={() => setIsCategoryModalVisible(true)}
          >
            <Ionicons name="add-circle" size={24} color="#1dd1a1" />
            <Text style={styles.addCategoryText}>Ajouter une catégorie</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={
          categories.length === 0 ? styles.emptyListContent : styles.listContent
        }
        ListEmptyComponent={renderEmptyState()}
        showsVerticalScrollIndicator={false}
      />

      {/* Category Modal */}
      <BottomModal
        visible={isCategoryModalVisible}
        onClose={() => {
          setIsCategoryModalVisible(false);
          setCategoryName("");
          setCategoryIcon("briefcase-outline");
        }}
      >
        <View style={styles.modalContent}>
          <Input
            placeholder="Nom de la catégorie"
            variant="input"
            value={categoryName}
            onChangeText={setCategoryName}
          />
          <View style={styles.fullWidth}>
            <Text style={styles.label}>Icône</Text>
            <Dropdown
              value={categoryIcon}
              options={ICON_OPTIONS}
              onChange={(value) => setCategoryIcon(value as string)}
            />
          </View>
          <Button
            label="Créer"
            onPress={handleCreateCategory}
            variant="btnPrimary"
            color="white"
            disabled={!categoryName.trim()}
          />
        </View>
      </BottomModal>

      {/* Item Modal */}
      <BottomModal
        visible={isItemModalVisible}
        onClose={() => {
          setIsItemModalVisible(false);
          setItemName("");
        }}
        enableDynamicSizing={true}
      >
        <View style={styles.modalContent}>
          <Input
            placeholder="Nom de l'article"
            variant="input"
            value={itemName}
            onChangeText={setItemName}
          />
          <Button
            label="Ajouter"
            onPress={handleCreateItem}
            variant="btnPrimary"
            color="white"
            disabled={!itemName.trim()}
          />
        </View>
      </BottomModal>

      {/* Category Actions Modal */}
      <BottomModal
        visible={isCategoryActionsModalVisible}
        onClose={() => {
          setIsCategoryActionsModalVisible(false);
          setSelectedCategory(null);
        }}
        enableDynamicSizing={true}
      >
        <View style={styles.actionsContent}>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => {
              setShowDeleteCategoryDialog(true);
              setIsCategoryActionsModalVisible(false);
            }}
          >
            <Ionicons name="trash-outline" size={24} color="#e55039" />
            <Text style={[styles.actionItemTitle, { color: "#e55039" }]}>
              Supprimer la catégorie
            </Text>
          </TouchableOpacity>
        </View>
      </BottomModal>

      {/* Item Actions Modal */}
      <BottomModal
        visible={isItemActionsModalVisible}
        onClose={() => {
          setIsItemActionsModalVisible(false);
          setSelectedItem(null);
        }}
        enableDynamicSizing={true}
      >
        <View style={styles.actionsContent}>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => {
              setShowDeleteItemDialog(true);
              setIsItemActionsModalVisible(false);
            }}
          >
            <Ionicons name="trash-outline" size={24} color="#e55039" />
            <Text style={[styles.actionItemTitle, { color: "#e55039" }]}>
              Supprimer l&apos;article
            </Text>
          </TouchableOpacity>
        </View>
      </BottomModal>

      {/* Delete Dialogs */}
      <AlertDialog
        visible={showDeleteCategoryDialog}
        title="Supprimer la catégorie"
        message="Êtes-vous sûr de vouloir supprimer cette catégorie et tous ses articles ?"
        variant="danger"
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleDeleteCategory}
        onCancel={() => setShowDeleteCategoryDialog(false)}
      />

      <AlertDialog
        visible={showDeleteItemDialog}
        title="Supprimer l'article"
        message="Êtes-vous sûr de vouloir supprimer cet article ?"
        variant="danger"
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleDeleteItem}
        onCancel={() => setShowDeleteItemDialog(false)}
      />

      <AlertDialog
        visible={showSuccessDialog}
        title="Succès"
        message={successMessage}
        confirmText="OK"
        onConfirm={() => setShowSuccessDialog(false)}
      />

      <AlertDialog
        visible={showErrorDialog}
        title="Erreur"
        message={errorMessage}
        variant="danger"
        confirmText="OK"
        onConfirm={() => setShowErrorDialog(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  tripSelectorContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addCategoryButtonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  addCategoryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addCategoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1dd1a1",
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#222f3e",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#617989",
    textAlign: "center",
  },
  itemsContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  addItemButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f9fafb",
  },
  addItemText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1dd1a1",
  },
  modalContent: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  fullWidth: {
    width: 320,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111518",
    marginBottom: 8,
  },
  actionsContent: {
    flexDirection: "column",
    paddingBottom: 20,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 4,
    gap: 16,
  },
  actionItemTitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "#111518",
  },
});
