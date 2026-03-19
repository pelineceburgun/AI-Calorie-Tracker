import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Meal, DailySummary } from "@/types";

const STORAGE_KEY = "@calorie_tracker_meals";

interface MealsContext {
  meals: Meal[];
  isLoading: boolean;
  addMeal: (meal: Omit<Meal, "id">) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  getDailySummary: (date: Date) => DailySummary;
  getMealsByDate: (date: Date) => Meal[];
}

export const [MealsContext, useMeals] = createContextHook<MealsContext>(() => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMeals = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setMeals(parsed.map((m: Meal) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        })));
      }
    } catch (error) {
      console.error("Failed to load meals:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMeals();
  }, [loadMeals]);

  const saveMeals = useCallback(async (newMeals: Meal[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newMeals));
    } catch (error) {
      console.error("Failed to save meals:", error);
    }
  }, []);

  const addMeal = useCallback(async (meal: Omit<Meal, "id">) => {
    const newMeal: Meal = {
      ...meal,
      id: Math.random().toString(36).substring(7),
    };
    setMeals((prev) => {
      const updated = [newMeal, ...prev];
      void saveMeals(updated);
      return updated;
    });
  }, [saveMeals]);

  const deleteMeal = useCallback(async (id: string) => {
    setMeals((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      void saveMeals(updated);
      return updated;
    });
  }, [saveMeals]);

  const getMealsByDate = useCallback((date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return meals.filter((meal) => {
      const mealDate = new Date(meal.timestamp);
      return mealDate >= startOfDay && mealDate <= endOfDay;
    });
  }, [meals]);

  const getDailySummary = useCallback((date: Date): DailySummary => {
    const dayMeals = meals.filter((meal) => {
      const mealDate = new Date(meal.timestamp);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      return mealDate >= startOfDay && mealDate <= endOfDay;
    });
    return {
      date,
      meals: dayMeals,
      totalCalories: dayMeals.reduce((sum, m) => sum + m.totalCalories, 0),
      totalProtein: dayMeals.reduce((sum, m) => sum + m.totalProtein, 0),
      totalCarbs: dayMeals.reduce((sum, m) => sum + m.totalCarbs, 0),
      totalFat: dayMeals.reduce((sum, m) => sum + m.totalFat, 0),
    };
  }, [meals]);

  return useMemo(() => ({
    meals,
    isLoading,
    addMeal,
    deleteMeal,
    getDailySummary,
    getMealsByDate,
  }), [meals, isLoading, addMeal, deleteMeal, getDailySummary, getMealsByDate]);
});
