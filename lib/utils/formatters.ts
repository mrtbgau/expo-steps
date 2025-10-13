export class DateFormatter {
  static formatDateRange(start: string, end: string): string {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };
    return `${startDate.toLocaleDateString(
      "fr-FR",
      options
    )} - ${endDate.toLocaleDateString("fr-FR", options)}`;
  }

  static calculateDuration(start: string, end: string): string {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} jour${diffDays > 1 ? "s" : ""}`;
  }

  static toISOString(date: Date): string {
    return date.toISOString();
  }
}

export class TripCategorizer {
  static categorizeTrips<T extends { end_date: string }>(trips: T[]): {
    past: T[];
    upcoming: T[];
  } {
    const now = new Date();
    const past = trips.filter((trip) => new Date(trip.end_date) < now);
    const upcoming = trips.filter((trip) => new Date(trip.end_date) >= now);
    return { past, upcoming };
  }
}
