"use client";

import { useParams } from 'next/navigation';
import { useRecipes } from '@/context/recipe-context';
import { RecipeForm } from '@/components/recipe-form';

export default function EditRecipePage() {
  const params = useParams();
  const { getRecipeById } = useRecipes();
  const recipe = getRecipeById(params.id as string);

  if (!recipe) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-xl text-muted-foreground">Recette non trouvée.</p>
      </div>
    );
  }

  return <RecipeForm initialData={recipe} />;
}
