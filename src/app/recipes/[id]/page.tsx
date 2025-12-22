"use client";

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useRecipes } from '@/context/recipe-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Soup, Trash2, Pencil } from 'lucide-react';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getRecipeById, deleteRecipe } = useRecipes();
  const recipe = getRecipeById(params.id as string);

  if (!recipe) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-xl text-muted-foreground">Recette non trouvée.</p>
      </div>
    );
  }

  const handleDelete = () => {
    deleteRecipe(recipe.id);
    router.push('/');
  };

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <article className="bg-card p-6 sm:p-8 rounded-2xl shadow-lg animate-in fade-in-50 duration-500">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Badge variant="secondary">{recipe.category}</Badge>
            <h1 className="mt-2 font-serif text-4xl sm:text-5xl font-bold text-primary">
              {recipe.title}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">{recipe.description}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button asChild variant="outline" size="icon">
              <Link href={`/recipes/${recipe.id}/edit`}>
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Modifier</span>
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
                   <span className="sr-only">Supprimer</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. La recette sera définitivement supprimée.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="relative my-8 h-64 sm:h-96 w-full overflow-hidden rounded-lg">
          <Image
            src={recipe.imageUrl}
            alt={recipe.title}
            fill
            className="object-cover"
            data-ai-hint={recipe.imageHint}
          />
        </div>

        <div className="my-8 grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
          <div className="bg-background/50 p-4 rounded-lg">
            <Clock className="mx-auto h-8 w-8 text-primary" />
            <p className="mt-2 font-semibold">Préparation</p>
            <p className="text-muted-foreground">{recipe.prepTime} min</p>
          </div>
          <div className="bg-background/50 p-4 rounded-lg">
            <Soup className="mx-auto h-8 w-8 text-primary" />
            <p className="mt-2 font-semibold">Cuisson</p>
            <p className="text-muted-foreground">{recipe.cookTime} min</p>
          </div>
          <div className="bg-background/50 p-4 rounded-lg col-span-2 sm:col-span-1">
            <Users className="mx-auto h-8 w-8 text-primary" />
            <p className="mt-2 font-semibold">Portions</p>
            <p className="text-muted-foreground">{recipe.servings} personnes</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-x-8 gap-y-12">
          <div className="md:col-span-1">
            <h2 className="font-serif text-2xl font-bold mb-4 border-b-2 border-primary pb-2">Ingrédients</h2>
            <ul className="space-y-3">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-primary font-bold mr-3 mt-1">&#8226;</span>
                  <span><strong>{ingredient.quantity}</strong> {ingredient.name}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-2">
            <h2 className="font-serif text-2xl font-bold mb-4 border-b-2 border-primary pb-2">Préparation</h2>
            <ol className="space-y-6">
              {recipe.steps.map((step, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold mr-4 flex-shrink-0">{index + 1}</span>
                  <p className="pt-1">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </article>
    </div>
  );
}
