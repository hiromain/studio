export type Ingredient = {
  id: string;
  name: string;
  quantity: string;
};

export type Recipe = {
  id: string;
  title: string;
  description: string;
  category: 'Entrée' | 'Plat Principal' | 'Dessert' | 'Boisson' | 'Autre';
  prepTime: number;
  cookTime: number;
  servings: number;
  ingredients: Ingredient[];
  steps: string[];
  imageUrl: string;
  imageHint: string;
};
