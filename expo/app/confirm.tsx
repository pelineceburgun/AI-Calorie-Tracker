import { useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useMeals } from "@/providers/MealsProvider";
import Colors from "@/constants/colors";
import { Check, ArrowLeft, Utensils, Flame, Dumbbell, Wheat as WheatIcon, Droplets } from "lucide-react-native";
import type { FoodItem } from "@/types";

export default function ConfirmScreen() {
  const router = useRouter();
  const { addMeal, isLoading } = useMeals();
  const params = useLocalSearchParams<{
    foods: string;
    totalCalories: string;
    totalProtein: string;
    totalCarbs: string;
    totalFat: string;
    imageUri: string;
  }>();

  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const slideAnim = useMemo(() => new Animated.Value(20), []);

  Animated.parallel([
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }),
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }),
  ]).start();

  const foods: FoodItem[] = useMemo(() => {
    try {
      return JSON.parse(params.foods ?? "[]");
    } catch {
      return [];
    }
  }, [params.foods]);

  const totals = useMemo(
    () => ({
      calories: parseInt(params.totalCalories ?? "0", 10),
      protein: parseFloat(params.totalProtein ?? "0"),
      carbs: parseFloat(params.totalCarbs ?? "0"),
      fat: parseFloat(params.totalFat ?? "0"),
    }),
    [params]
  );

  const imageUri = params.imageUri ?? "";

  const handleSave = useCallback(async () => {
    if (foods.length === 0) return;

    await addMeal({
      timestamp: new Date(),
      foods,
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFat: totals.fat,
      imageUri,
    });

    router.push("/");
  }, [foods, totals, imageUri, addMeal, router]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Meal</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {imageUri ? (
          <Animated.View style={[styles.imageContainer, { opacity: fadeAnim }]}>
            <Image source={{ uri: imageUri }} style={styles.mealImage} />
          </Animated.View>
        ) : null}

        <Animated.View
          style={[
            styles.summaryCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.summaryHeader}>
            <View style={styles.summaryIconContainer}>
              <Utensils size={20} color={Colors.light.tint} />
            </View>
            <Text style={styles.summaryTitle}>Meal Summary</Text>
          </View>

          <View style={styles.totalCaloriesContainer}>
            <Flame size={28} color={Colors.light.accent} />
            <Text style={styles.totalCaloriesValue}>{totals.calories}</Text>
            <Text style={styles.totalCaloriesLabel}>calories total</Text>
          </View>

          <View style={styles.macrosGrid}>
            <View style={styles.macroBox}>
              <View style={[styles.macroIcon, { backgroundColor: "#FEE2E2" }]}>
                <Dumbbell size={16} color={Colors.light.protein} />
              </View>
              <Text style={styles.macroValue}>{Math.round(totals.protein)}g</Text>
              <Text style={styles.macroLabel}>Protein</Text>
            </View>
            <View style={styles.macroBox}>
              <View style={[styles.macroIcon, { backgroundColor: "#FEF3C7" }]}>
                <WheatIcon size={16} color={Colors.light.carbs} />
              </View>
              <Text style={styles.macroValue}>{Math.round(totals.carbs)}g</Text>
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
            <View style={styles.macroBox}>
              <View style={[styles.macroIcon, { backgroundColor: "#DBEAFE" }]}>
                <Droplets size={16} color={Colors.light.fat} />
              </View>
              <Text style={styles.macroValue}>{Math.round(totals.fat)}g</Text>
              <Text style={styles.macroLabel}>Fat</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.foodsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.foodsTitle}>Food Items ({foods.length})</Text>

          {foods.map((food, index) => (
            <View key={food.id} style={styles.foodCard}>
              <View style={styles.foodHeader}>
                <Text style={styles.foodName}>{food.name}</Text>
                <View style={styles.confidenceBadge}>
                  <Text style={styles.confidenceText}>{food.confidence}%</Text>
                </View>
              </View>
              <Text style={styles.foodPortion}>{food.portion}</Text>
              <View style={styles.foodMacros}>
                <Text style={styles.foodCalorie}>{food.calories} cal</Text>
                <View style={styles.macroDetails}>
                  <Text style={styles.macroDetailText}>P: {food.protein}g</Text>
                  <Text style={styles.macroDetailText}>C: {food.carbs}g</Text>
                  <Text style={styles.macroDetailText}>F: {food.fat}g</Text>
                </View>
              </View>
              {index < foods.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
          testID="save-meal-button"
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Check size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Save to Diary</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.light.text,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  imageContainer: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  mealImage: {
    width: "100%",
    height: 220,
  },
  summaryCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
  },
  totalCaloriesContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  totalCaloriesValue: {
    fontSize: 48,
    fontWeight: "700",
    color: Colors.light.text,
    marginTop: 8,
  },
  totalCaloriesLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  macrosGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  macroBox: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.light.background,
    borderRadius: 16,
  },
  macroIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  foodsContainer: {
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  foodsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 16,
  },
  foodCard: {
    paddingVertical: 16,
  },
  foodHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  foodName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    flex: 1,
  },
  confidenceBadge: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.light.tintDark,
  },
  foodPortion: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  foodMacros: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  foodCalorie: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.accent,
  },
  macroDetails: {
    flexDirection: "row",
    gap: 12,
  },
  macroDetailText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginTop: 16,
  },
  footer: {
    backgroundColor: Colors.light.card,
    padding: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  saveButton: {
    backgroundColor: Colors.light.tint,
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
