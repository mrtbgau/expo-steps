import bcrypt from "bcryptjs";
import { IUserService } from "../interfaces/IUserService";
import { IDatabaseConnection } from "../interfaces/IDatabaseConnection";
import { EmailValidator, PasswordValidator } from "../utils/validators";
import { User } from "./types";

bcrypt.setRandomFallback((len: number) => {
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes);
});

class UserService implements IUserService {
  constructor(private dbConnection: IDatabaseConnection) {}

  async createUser(email: string, password: string): Promise<User | null> {
    const db = await this.dbConnection.init();
    if (!db) return null;

    try {
      const emailError = EmailValidator.validate(email);
      if (emailError) {
        throw new Error(emailError);
      }

      const passwordError = PasswordValidator.validate(password);
      if (passwordError) {
        throw new Error(passwordError);
      }

      const normalizedEmail = EmailValidator.normalize(email);

      const existingUser = await this.getUserByEmail(normalizedEmail);
      if (existingUser) {
        throw new Error("Un compte avec cet email existe déjà");
      }

      const hashedPassword = await this.hashPassword(password);

      const result = await db.runAsync(
        "INSERT INTO users (email, password) VALUES (?, ?)",
        [normalizedEmail, hashedPassword]
      );

      const user = await db.getFirstAsync<User>(
        "SELECT id, email, created_at FROM users WHERE id = ?",
        [result.lastInsertRowId]
      );

      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erreur lors de la création du compte");
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const db = await this.dbConnection.init();
    if (!db) return null;

    const emailError = EmailValidator.validate(email);
    if (emailError) return null;

    const normalizedEmail = EmailValidator.normalize(email);
    const user = await db.getFirstAsync<User>(
      "SELECT * FROM users WHERE email = ?",
      [normalizedEmail]
    );

    return user;
  }

  async verifyPassword(email: string, password: string): Promise<User | null> {
    const emailError = EmailValidator.validate(email);
    if (emailError) {
      throw new Error("Email et mot de passe sont requis");
    }

    const passwordError = PasswordValidator.validate(password);
    if (passwordError) {
      throw new Error("Email et mot de passe sont requis");
    }

    const user = await this.getUserByEmail(email);
    if (!user || !user.password) {
      throw new Error("Email ou mot de passe invalide");
    }

    const isValid = bcrypt.compareSync(password, user.password);

    if (!isValid) {
      throw new Error("Email ou mot de passe invalide");
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async deleteUser(email: string): Promise<boolean> {
    const db = await this.dbConnection.init();
    if (!db) return false;

    const emailError = EmailValidator.validate(email);
    if (emailError) {
      throw new Error(emailError);
    }

    try {
      const normalizedEmail = EmailValidator.normalize(email);

      const user = await this.getUserByEmail(normalizedEmail);
      if (!user) {
        throw new Error("Utilisateur introuvable");
      }

      const result = await db.runAsync(
        "DELETE FROM users WHERE email = ?",
        [normalizedEmail]
      );

      return result.changes > 0;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  }
}

export { UserService };
