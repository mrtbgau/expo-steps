import AlertDialog from "@/components/AlertDialog";
import BottomModal from "@/components/BottomModal";
import Button from "@/components/Button";
import Header from "@/components/Header";
import Input from "@/components/Input";
import CollaboratorRow from "@/components/sharing/CollaboratorRow";
import ShareLinkCard from "@/components/sharing/ShareLinkCard";
import { useAuth } from "@/contexts/AuthContext";
import { useSharing } from "@/contexts/SharingContext";
import { useTrips } from "@/contexts/TripContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TripSharingScreen() {
  const router = useRouter();
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const { user } = useAuth();
  const { trips } = useTrips();
  const {
    shares,
    collaborators,
    isLoading,
    setCurrentTripId,
    createShare,
    revokeShare,
    addCollaborator,
    deleteCollaborator,
  } = useSharing();

  const [selectedShareType, setSelectedShareType] = useState<
    "read-only" | "collaborator"
  >("read-only");
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [isCollaboratorModalVisible, setIsCollaboratorModalVisible] =
    useState(false);
  const [collaboratorEmail, setCollaboratorEmail] = useState("");
  const [collaboratorRole, setCollaboratorRole] = useState<"editor" | "viewer">(
    "editor"
  );
  const [selectedShare, setSelectedShare] = useState<number | null>(null);
  const [selectedCollaborator, setSelectedCollaborator] = useState<
    number | null
  >(null);

  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [showDeleteCollabDialog, setShowDeleteCollabDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const currentTripId = parseInt(tripId || "0", 10);
  const trip = trips.find((t) => t.id === currentTripId);

  useEffect(() => {
    if (currentTripId) {
      setCurrentTripId(currentTripId);
    }
  }, [currentTripId, setCurrentTripId]);

  const handleCreateShare = async () => {
    if (!user || !currentTripId) return;

    try {
      await createShare(currentTripId, user.id, selectedShareType);
      setIsShareModalVisible(false);
      setSuccessMessage("Lien de partage créé !");
      setShowSuccessDialog(true);
    } catch {
      setErrorMessage("Erreur lors de la création du lien");
      setShowErrorDialog(true);
    }
  };

  const handleRevokeShare = async () => {
    if (!selectedShare) return;

    try {
      await revokeShare(selectedShare);
      setShowRevokeDialog(false);
      setSelectedShare(null);
      setSuccessMessage("Lien révoqué avec succès !");
      setShowSuccessDialog(true);
    } catch {
      setErrorMessage("Erreur lors de la révocation");
      setShowErrorDialog(true);
    }
  };

  const handleNativeShare = async (shareUrl: string) => {
    if (!trip) return;

    try {
      await Share.share({
        message: `Rejoignez-moi pour mon voyage à ${
          trip.title
        }!\n\nDates: ${new Date(trip.start_date).toLocaleDateString(
          "fr-FR"
        )} - ${new Date(trip.end_date).toLocaleDateString(
          "fr-FR"
        )}\n\nLien: ${shareUrl}`,
        title: `Voyage: ${trip.title}`,
      });
    } catch {
      setErrorMessage("Erreur lors du partage");
      setShowErrorDialog(true);
    }
  };

  const handleAddCollaborator = async () => {
    if (!currentTripId || !collaboratorEmail.trim()) return;

    try {
      await addCollaborator(currentTripId, collaboratorEmail, collaboratorRole);
      setIsCollaboratorModalVisible(false);
      setCollaboratorEmail("");
      setSuccessMessage("Collaborateur invité !");
      setShowSuccessDialog(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Erreur lors de l'invitation"
      );
      setShowErrorDialog(true);
    }
  };

  const handleDeleteCollaborator = async () => {
    if (!selectedCollaborator) return;

    try {
      await deleteCollaborator(selectedCollaborator);
      setShowDeleteCollabDialog(false);
      setSelectedCollaborator(null);
      setSuccessMessage("Collaborateur supprimé !");
      setShowSuccessDialog(true);
    } catch {
      setErrorMessage("Erreur lors de la suppression");
      setShowErrorDialog(true);
    }
  };

  if (!trip) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header
          title="Partage"
          onPress={() => router.back()}
          icon="arrow-back"
          iconPosition="left"
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Voyage introuvable</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Partager le voyage"
        onPress={() => router.back()}
        icon="arrow-back"
        iconPosition="left"
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.tripInfo}>
          <Text style={styles.tripTitle}>{trip.title}</Text>
          <Text style={styles.tripDates}>
            {new Date(trip.start_date).toLocaleDateString("fr-FR")} -{" "}
            {new Date(trip.end_date).toLocaleDateString("fr-FR")}
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Liens de partage</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setIsShareModalVisible(true)}
            >
              <Ionicons name="add-circle" size={24} color="#1dd1a1" />
              <Text style={styles.addButtonText}>Créer un lien</Text>
            </TouchableOpacity>
          </View>
          {isLoading ? (
            <ActivityIndicator size="small" color="#1dd1a1" />
          ) : shares.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="link-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>Aucun lien de partage</Text>
            </View>
          ) : (
            <FlatList
              data={shares}
              renderItem={({ item }) => (
                <ShareLinkCard
                  shareToken={item.share_token}
                  shareType={item.share_type}
                  createdAt={item.created_at}
                  expiresAt={item.expires_at}
                  onRevoke={() => {
                    setSelectedShare(item.id);
                    setShowRevokeDialog(true);
                  }}
                  onShare={() =>
                    handleNativeShare(`exposteps://trip/${item.share_token}`)
                  }
                />
              )}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Collaborateurs</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setIsCollaboratorModalVisible(true)}
            >
              <Ionicons name="person-add" size={24} color="#1dd1a1" />
              <Text style={styles.addButtonText}>Inviter</Text>
            </TouchableOpacity>
          </View>

          {collaborators.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>Aucun collaborateur</Text>
            </View>
          ) : (
            <FlatList
              data={collaborators}
              renderItem={({ item }) => (
                <CollaboratorRow
                  email={item.user_email}
                  role={item.role}
                  status={item.status}
                  invitedAt={item.invited_at}
                  onLongPress={() => {
                    setSelectedCollaborator(item.id);
                    setShowDeleteCollabDialog(true);
                  }}
                />
              )}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      {/* Share Modal */}
      <BottomModal
        visible={isShareModalVisible}
        onClose={() => setIsShareModalVisible(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Type de partage</Text>

          <TouchableOpacity
            style={[
              styles.shareTypeOption,
              selectedShareType === "read-only" && styles.shareTypeSelected,
            ]}
            onPress={() => setSelectedShareType("read-only")}
          >
            <Ionicons
              name="eye-outline"
              size={24}
              color={selectedShareType === "read-only" ? "#1dd1a1" : "#617989"}
            />
            <View style={styles.shareTypeText}>
              <Text style={styles.shareTypeTitle}>Lecture seule</Text>
              <Text style={styles.shareTypeDescription}>
                Les destinataires peuvent uniquement voir le voyage
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.shareTypeOption,
              selectedShareType === "collaborator" && styles.shareTypeSelected,
            ]}
            onPress={() => setSelectedShareType("collaborator")}
          >
            <Ionicons
              name="people-outline"
              size={24}
              color={
                selectedShareType === "collaborator" ? "#1dd1a1" : "#617989"
              }
            />
            <View style={styles.shareTypeText}>
              <Text style={styles.shareTypeTitle}>Collaborateur</Text>
              <Text style={styles.shareTypeDescription}>
                Les destinataires peuvent modifier le voyage
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.buttonContainer}>
            <Button
              label="Créer le lien"
              onPress={handleCreateShare}
              variant="btnPrimary"
              color="white"
            />
          </View>
        </View>
      </BottomModal>

      {/* Collaborator Modal */}
      <BottomModal
        visible={isCollaboratorModalVisible}
        onClose={() => {
          setIsCollaboratorModalVisible(false);
          setCollaboratorEmail("");
        }}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Inviter un collaborateur</Text>
          <Input
            placeholder="Email du collaborateur"
            variant="input"
            value={collaboratorEmail}
            onChangeText={setCollaboratorEmail}
          />
          <View style={styles.roleSelector}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                collaboratorRole === "editor" && styles.roleButtonSelected,
              ]}
              onPress={() => setCollaboratorRole("editor")}
            >
              <Text
                style={[
                  styles.roleButtonText,
                  collaboratorRole === "editor" &&
                    styles.roleButtonTextSelected,
                ]}
              >
                Éditeur
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleButton,
                collaboratorRole === "viewer" && styles.roleButtonSelected,
              ]}
              onPress={() => setCollaboratorRole("viewer")}
            >
              <Text
                style={[
                  styles.roleButtonText,
                  collaboratorRole === "viewer" &&
                    styles.roleButtonTextSelected,
                ]}
              >
                Observateur
              </Text>
            </TouchableOpacity>
          </View>
          <Button
            label="Envoyer l'invitation"
            onPress={handleAddCollaborator}
            variant="btnPrimary"
            color="white"
            disabled={!collaboratorEmail.trim()}
          />
        </View>
      </BottomModal>

      {/* Dialogs */}
      <AlertDialog
        visible={showRevokeDialog}
        title="Révoquer le lien"
        message="Êtes-vous sûr de vouloir révoquer ce lien de partage ?"
        variant="danger"
        confirmText="Révoquer"
        cancelText="Annuler"
        onConfirm={handleRevokeShare}
        onCancel={() => setShowRevokeDialog(false)}
      />

      <AlertDialog
        visible={showDeleteCollabDialog}
        title="Supprimer le collaborateur"
        message="Êtes-vous sûr de vouloir supprimer ce collaborateur ?"
        variant="danger"
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleDeleteCollaborator}
        onCancel={() => setShowDeleteCollabDialog(false)}
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#617989",
  },
  tripInfo: {
    padding: 16,
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f3f4",
  },
  tripTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111518",
    marginBottom: 4,
  },
  tripDates: {
    fontSize: 14,
    color: "#617989",
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111518",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1dd1a1",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: "#617989",
    marginTop: 8,
  },
  modalContent: {
    flexDirection: "column",
    gap: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111518",
    textAlign: "center",
  },
  shareTypeOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#f0f3f4",
    gap: 12,
  },
  shareTypeSelected: {
    borderColor: "#1dd1a1",
    backgroundColor: "#f0fdf9",
  },
  shareTypeText: {
    flex: 1,
  },
  shareTypeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111518",
    marginBottom: 4,
  },
  shareTypeDescription: {
    fontSize: 12,
    color: "#617989",
  },
  roleSelector: {
    flexDirection: "row",
    gap: 12,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#f0f3f4",
    alignItems: "center",
  },
  roleButtonSelected: {
    borderColor: "#1dd1a1",
    backgroundColor: "#f0fdf9",
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#617989",
  },
  roleButtonTextSelected: {
    color: "#1dd1a1",
  },
  buttonContainer: {
    alignItems: "center",
  },
});
