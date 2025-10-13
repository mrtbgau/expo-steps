import { Trip } from "../database/types";

export interface ITripService {
  createTrip(
    userId: number,
    title: string,
    startDate: string,
    endDate: string,
    imageUri: string | null,
    notes?: string
  ): Promise<Trip | null>;
  getTrips(userId: number): Promise<Trip[]>;
  updateTrip(
    tripId: number,
    title: string,
    startDate: string,
    endDate: string,
    imageUri: string | null,
    notes?: string
  ): Promise<Trip | null>;
  deleteTrip(tripId: number): Promise<boolean>;
}
