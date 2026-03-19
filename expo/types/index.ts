export interface FoodItem {
  id: string;
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: number;
}

export interface Meal {
  id: string;
  timestamp: Date;
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  imageUri?: string;
}

export interface DailySummary {
  date: Date;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  meals: Meal[];
}

export interface User {
  id: string;
  email: string;
  dailyCalorieGoal: number;
}
