import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";
import { databaseService, User } from "../lib/database";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_TOKEN_KEY = "userToken";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const userEmail = await SecureStore.getItemAsync(USER_TOKEN_KEY);
      if (userEmail) {
        const storedUser = await databaseService.getUserByEmail(userEmail);
        if (storedUser) {
          const { password, ...userWithoutPassword } = storedUser;
          setUser(userWithoutPassword);
        }
      }
    } catch (error) {
      console.error("Error loading stored user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const authenticatedUser = await databaseService.verifyPassword(
        email,
        password
      );
      if (!authenticatedUser) {
        throw new Error("Invalid email or password");
      }

      setUser(authenticatedUser);
      await SecureStore.setItemAsync(USER_TOKEN_KEY, email);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const newUser = await databaseService.createUser(email, password);
      if (!newUser) {
        throw new Error("Failed to create user");
      }

      setUser(newUser);
      await SecureStore.setItemAsync(USER_TOKEN_KEY, email);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    await SecureStore.deleteItemAsync(USER_TOKEN_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
