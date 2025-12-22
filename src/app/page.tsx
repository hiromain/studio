"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useRecipes } from '@/context/recipe-context';
import { RecipeCard } from '@/components/recipe-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Search } from 'lucide-react';
import type { Recipe } from '@/lib/types';

export default function HomePage() {
  const { recipes } = useRecipes();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedRecipes, setSelectedRecipes] = useState<Set<string>>(new Set());

  const categories = useMemo(() => ['all', ...Array.from(new Set(recipes.map(r => r.category)))], [recipes]);

  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            recipe.ingredients.some(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = categoryFilter === 'all' || recipe.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [recipes, searchTerm, categoryFilter]);

  const handleSelectRecipe = (recipeId: string, isSelected: boolean) => {
    setSelectedRecipes(prev => {
      const newSelection = new Set(prev);
      if (isSelected) {
        newSelection.add(recipeId);
      } else {
        newSelection.delete(recipeId);
      }
      return newSelection;
    });
  };

  const generateShoppingList = () => {
    if (selectedRecipes.size > 0) {
      const ids = Array.from(selectedRecipes).join(',');
      router.push(`/shopping-list?ids=${ids}`);
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold font-headline tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Découvrez nos recettes
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Explorez, cuisinez, et régalez-vous. Votre aventure culinaire commence ici.
        </p>
      </div>

      <div className="mb-8 p-6 bg-card rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher par nom ou ingrédient..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <div>
            <Label htmlFor="category-filter" className="text-sm font-medium">Filtrer par catégorie</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger id="category-filter" className="w-full">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'Toutes les catégories' : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {selectedRecipes.size > 0 && (
        <div className="mb-8 flex justify-center sticky top-20 z-10">
          <Button onClick={generateShoppingList} size="lg" className="shadow-lg animate-in fade-in zoom-in">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Générer la liste de courses ({selectedRecipes.size})
          </Button>
        </div>
      )}

      {filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredRecipes.map(recipe => (
            <div key={recipe.id} className="relative group animate-in fade-in-50 duration-500">
               <RecipeCard recipe={recipe} />
               <div className="absolute top-4 right-4 z-10 bg-background/80 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <Checkbox
                   id={`select-${recipe.id}`}
                   onCheckedChange={(checked) => handleSelectRecipe(recipe.id, !!checked)}
                   checked={selectedRecipes.has(recipe.id)}
                   aria-label={`Sélectionner ${recipe.title}`}
                 />
               </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl text-muted-foreground">Aucune recette ne correspond à votre recherche.</p>
        </div>
      )}
    </div>
  );
}
