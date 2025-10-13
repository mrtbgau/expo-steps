import { User } from "../database/types";

export interface IUserService {
  createUser(email: string, password: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  verifyPassword(email: string, password: string): Promise<User | null>;
  deleteUser(email: string): Promise<boolean>;
}
