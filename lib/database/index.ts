import { UserService } from "./users";
import { TripService } from "./trips";
import { dbConnection } from "./connection";

export { stopService } from "./stops";
export { journalService } from "./journal";
export { checklistService } from "./checklist";
export { sharingService } from "./sharing";
export { dbConnection } from "./connection";
export type { User, Trip, Stop, JournalEntry, JournalPhoto, ChecklistCategory, ChecklistItem, ChecklistReminder, TripShare, TripCollaborator } from "./types";

export const userService = new UserService(dbConnection);
export const tripService = new TripService(dbConnection);
