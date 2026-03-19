import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";

interface User {
  id: string;
  email: string;
  dailyCalorieGoal: number;
}

interface AuthContext {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, _password: string) => Promise<void>;
  signUp: (email: string, _password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const STORAGE_KEY = "@calorie_tracker_user";

export const [AuthContext, useAuth] = createContextHook<AuthContext>(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load user:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  const signIn = useCallback(async (email: string, _password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const mockUser: User = {
      id: Math.random().toString(36).substring(7),
      email,
      dailyCalorieGoal: 2000,
    };
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    setUser(mockUser);
  }, []);

  const signUp = useCallback(async (email: string, _password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const mockUser: User = {
      id: Math.random().toString(36).substring(7),
      email,
      dailyCalorieGoal: 2000,
    };
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    setUser(mockUser);
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return useMemo(() => ({ user, isLoading, signIn, signUp, signOut }), [user, isLoading, signIn, signUp, signOut]);
});
