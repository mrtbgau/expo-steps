export class EmailValidator {
  static validate(email: string): string | null {
    if (!email || typeof email !== "string") {
      return "Email invalide";
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      return "L'email est requis";
    }

    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      return "Format d'email invalide";
    }

    return null;
  }

  static normalize(email: string): string {
    return email.toLowerCase().trim();
  }
}

export class PasswordValidator {
  private static readonly MIN_LENGTH = 6;

  static validate(password: string): string | null {
    if (!password || typeof password !== "string") {
      return "Mot de passe invalide";
    }

    if (password.length < this.MIN_LENGTH) {
      return `Le mot de passe doit contenir au moins ${this.MIN_LENGTH} caractères`;
    }

    return null;
  }
}

export class TripValidator {
  static validateTitle(title: string): string | null {
    if (!title || !title.trim()) {
      return "Le nom du voyage est requis";
    }
    return null;
  }

  static validateDates(startDate: Date | undefined, endDate: Date | undefined): {
    startDate: string | null;
    endDate: string | null
  } {
    const errors = { startDate: null as string | null, endDate: null as string | null };

    if (!startDate) {
      errors.startDate = "La date de début est requise";
    }

    if (!endDate) {
      errors.endDate = "La date de fin est requise";
    }

    if (startDate && endDate && startDate > endDate) {
      errors.endDate = "La date de fin doit être après la date de début";
    }

    return errors;
  }
}
