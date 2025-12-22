export type Ingredient = {
  id: string;
  name: string;
  quantity: string;
};

export type Recipe = {
  id: string;
  title: string;
  description: string;
  category: 'Entrée' | 'Plat Principal' | 'Dessert' | 'Boisson' | 'Apéritif' | 'Autre';
  prepTime: number;
  cookTime: number;
  servings: number;
  ingredients: Ingredient[];
  steps: string[];
  imageUrl: string;
  imageHint: string;
};

export type MealType = 'Apéritif' | 'Entrée' | 'Plat Principal' | 'Dessert';

export const MEAL_TYPES: MealType[] = ['Apéritif', 'Entrée', 'Plat Principal', 'Dessert'];

export type PlannedRecipe = {
  recipeId: string;
  mealType: MealType;
};

export type MealSlot = 'Midi' | 'Soir';

export type PlannedMeal = {
  date: string; // YYYY-MM-DD
  meal: MealSlot;
  recipes: PlannedRecipe[];
  eventId?: string; // Link to an event
};

export type PlannedEvent = {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  duration: number; // in days
};

export type Confidence<T> = {
  value: T;
  confidence: number;
  justification: string;
};
