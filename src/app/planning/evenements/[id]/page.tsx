
'use client';

import { useParams, useRouter } from 'next/navigation';
import { usePlanning } from '@/context/planning-context';
import { useRecipes } from '@/context/recipe-context';
import { eachDayOfInterval, addDays, format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MEAL_TYPES, type MealSlot, type PlannedMeal, MealType, Recipe } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { X, PlusCircle, ArrowLeft, ShoppingCart, ChefHat, CheckCircle2, ChevronRight, ChevronLeft, Utensils } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export default function EventPlanningPage() {
  const params = useParams();
  const router = useRouter();
  const { getEventById, getPlanForDate, getMealsForEvent } = usePlanning();
  const eventId = params.id as string;
  const event = getEventById(eventId);
  const [isCookingMode, setIsCookingMode] = useState(false);

  const handleGenerateShoppingList = () => {
    const eventMeals = getMealsForEvent(eventId);
    const recipeIds = new Set<string>();
    eventMeals.forEach(meal => {
        meal.recipes.forEach(recipe => {
            recipeIds.add(recipe.recipeId);
        });
    });

    if (recipeIds.size > 0) {
      const ids = Array.from(recipeIds).join(',');
      router.push(`/liste-courses?ids=${ids}`);
    }
  };


  if (!event) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Événement non trouvé.</p>
        <Button onClick={() => router.push('/planning')} className="mt-4">
          Retour au planning
        </Button>
      </div>
    );
  }

  const startDate = parseISO(event.startDate);
  const eventDays = eachDayOfInterval({
    start: startDate,
    end: addDays(startDate, event.duration - 1),
  });
  
  const hasPlannedMeals = getMealsForEvent(eventId).length > 0;

  if (isCookingMode) {
      return <CookingMode event={event} onClose={() => setIsCookingMode(false)} />;
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-4">
         <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
                 <Button variant="ghost" onClick={() => router.push('/planning')} className="mb-2 -ml-4 hover:bg-primary/10">
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Retour aux événements
                </Button>
                <h1 className="text-4xl font-bold font-serif text-primary">
                {event.name}
                </h1>
                <p className="text-muted-foreground">
                Planification du {format(startDate, 'd MMMM', { locale: fr })} au{' '}
                {format(addDays(startDate, event.duration - 1), 'd MMMM yyyy', {
                    locale: fr,
                })}
                </p>
            </div>
             <div className="flex gap-2">
                {hasPlannedMeals && (
                    <>
                        <Button onClick={() => setIsCookingMode(true)} variant="secondary" size="lg" className="shadow-md bg-accent text-accent-foreground hover:bg-accent/90">
                            <ChefHat className="mr-2 h-5 w-5" />
                            Mode Cuisine
                        </Button>
                        <Button onClick={handleGenerateShoppingList} size="lg" className="shadow-lg">
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            Liste de courses
                        </Button>
                    </>
                )}
             </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventDays.map((day) => {
            const plans = getPlanForDate(day, eventId);
            const midiPlan = plans.find(p => p.meal === 'Midi');
            const soirPlan = plans.find(p => p.meal === 'Soir');
          return (
            <Card key={day.toString()} className="flex flex-col border-none shadow-md overflow-hidden rounded-2xl">
              <CardHeader className="text-center bg-muted/30 pb-4">
                <CardTitle className="font-serif text-xl capitalize">
                  {format(day, 'eeee d', { locale: fr })}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4 p-4">
                <MealSection date={day} meal="Midi" plan={midiPlan} eventId={eventId} />
                <MealSection date={day} meal="Soir" plan={soirPlan} eventId={eventId} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function MealSection({ date, meal, plan, eventId }: { date: Date; meal: MealSlot; plan?: PlannedMeal, eventId: string }) {
  const { getRecipeById } = useRecipes();
  const { removeRecipeFromPlan } = usePlanning();

  const sortedRecipes = plan?.recipes.sort((a, b) => MEAL_TYPES.indexOf(a.mealType) - MEAL_TYPES.indexOf(b.mealType));

  return (
    <div className="bg-background/80 p-4 rounded-xl flex-1 border border-border/50">
      <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg">{meal}</h3>
          <Badge variant="outline" className="text-[10px] uppercase tracking-tighter">{plan?.recipes.length || 0} plats</Badge>
      </div>
      <div className="space-y-2">
        {sortedRecipes && sortedRecipes.length > 0 ? (
          sortedRecipes.map(({ recipeId, mealType }) => {
            const recipe = getRecipeById(recipeId);
            if (!recipe) return null;
            return (
              <div key={`${recipeId}-${mealType}`} className="group flex justify-between items-center text-sm p-3 rounded-xl bg-card border border-transparent hover:border-primary/20 transition-all shadow-sm">
                <Link href={`/recettes/${recipeId}`} className="flex-1 truncate">
                  <span className="font-bold block">{recipe.title}</span>
                  <span className="text-muted-foreground text-xs uppercase font-medium">{mealType}</span>
                </Link>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10" onClick={() => removeRecipeFromPlan(date, meal, recipeId, mealType, eventId)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4 italic">Rien de prévu pour ce repas.</p>
        )}
      </div>
      <AddRecipeDialog date={date} meal={meal} eventId={eventId}>
        <Button variant="ghost" className="w-full mt-2 rounded-xl border border-dashed hover:bg-primary/5 hover:text-primary transition-colors h-10">
          <PlusCircle className="mr-2 h-4 w-4" />
          Planifier un plat
        </Button>
      </AddRecipeDialog>
    </div>
  );
}

function AddRecipeDialog({ date, meal, eventId, children }: { date: Date; meal: MealSlot; eventId: string; children: React.ReactNode; }) {
    const { recipes } = useRecipes();
    const { addRecipeToPlan } = usePlanning();
    const [selectedRecipe, setSelectedRecipe] = useState<string | undefined>();
    const [selectedMealType, setSelectedMealType] = useState<MealType | undefined>();
    const [isOpen, setIsOpen] = useState(false);

    const handleAdd = () => {
        if (selectedRecipe && selectedMealType) {
            addRecipeToPlan(date, meal, selectedRecipe, selectedMealType, eventId);
            setSelectedRecipe(undefined);
            setSelectedMealType(undefined);
            setIsOpen(false);
        }
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="font-serif text-xl">Ajouter une recette</DialogTitle>
                    <p className="text-sm text-muted-foreground">Pour le {meal.toLowerCase()} du {format(date, 'd MMMM', { locale: fr })}</p>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label className="font-bold">Recette</Label>
                        <Select onValueChange={setSelectedRecipe} value={selectedRecipe}>
                            <SelectTrigger className="rounded-xl h-12"><SelectValue placeholder="Choisir dans ma collection" /></SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {recipes.map(recipe => (
                                    <SelectItem key={recipe.id} value={recipe.id}>{recipe.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold">Type de plat</Label>
                        <Select onValueChange={(v) => setSelectedMealType(v as MealType)} value={selectedMealType}>
                             <SelectTrigger className="rounded-xl h-12"><SelectValue placeholder="Entrée, Plat, Dessert..." /></SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {MEAL_TYPES.map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Button onClick={handleAdd} disabled={!selectedRecipe || !selectedMealType} className="w-full h-12 rounded-xl font-bold">
                    Ajouter au planning
                </Button>
            </DialogContent>
        </Dialog>
    );
}


// --- Cooking Mode Component ---

function CookingMode({ event, onClose }: { event: any, onClose: () => void }) {
    const { getMealsForEvent } = usePlanning();
    const { getRecipeById } = useRecipes();
    const [currentRecipeIndex, setCurrentRecipeIndex] = useState(0);
    const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});

    const allRecipesInEvent = useMemo(() => {
        const meals = getMealsForEvent(event.id);
        const uniqueRecipes = new Map<string, Recipe>();
        
        meals.forEach(m => {
            m.recipes.forEach(r => {
                const recipe = getRecipeById(r.recipeId);
                if (recipe) uniqueRecipes.set(recipe.id, recipe);
            });
        });
        
        return Array.from(uniqueRecipes.values());
    }, [event.id, getMealsForEvent, getRecipeById]);

    const currentRecipe = allRecipesInEvent[currentRecipeIndex];

    const toggleStep = (stepIndex: number) => {
        const key = `${currentRecipe.id}-${stepIndex}`;
        setCheckedSteps(prev => ({ ...prev, [key]: !prev[key] }));
    }

    if (allRecipesInEvent.length === 0) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center text-center p-4">
                <ChefHat className="h-20 w-20 text-muted-foreground mb-4 opacity-20" />
                <h2 className="text-2xl font-serif font-bold">Rien à cuisiner !</h2>
                <p className="text-muted-foreground max-w-xs mt-2">Ajoute d'abord des recettes à ton planning pour lancer le mode cuisine.</p>
                <Button onClick={onClose} variant="ghost" className="mt-6">Retour au planning</Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background animate-in fade-in duration-500">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between">
                    <Button variant="ghost" onClick={onClose} className="gap-2">
                        <ArrowLeft className="h-4 w-4" /> Quitter
                    </Button>
                    <div className="flex items-center gap-2 font-serif font-bold text-lg text-primary">
                        <ChefHat className="h-5 w-5" /> Mode Cuisine
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">
                        {currentRecipeIndex + 1} / {allRecipesInEvent.length}
                    </div>
                </div>
            </header>

            <main className="container max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="rounded-full" 
                        disabled={currentRecipeIndex === 0}
                        onClick={() => setCurrentRecipeIndex(prev => prev - 1)}
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <div className="text-center">
                        <Badge variant="outline" className="mb-2 bg-primary/5 text-primary border-primary/20">{currentRecipe.category}</Badge>
                        <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">{currentRecipe.title}</h2>
                    </div>
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="rounded-full"
                        disabled={currentRecipeIndex === allRecipesInEvent.length - 1}
                        onClick={() => setCurrentRecipeIndex(prev => prev + 1)}
                    >
                        <ChevronRight className="h-6 w-6" />
                    </Button>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <Card className="border-none shadow-sm bg-muted/30 sticky top-24">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-xl font-serif">Ingrédients</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[40vh] lg:h-auto">
                                    <ul className="space-y-3">
                                        {currentRecipe.ingredients.map((ing, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm">
                                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                                <span className="leading-tight">
                                                    <span className="font-bold">{ing.quantity}</span> {ing.name}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                         <Card className="border-none shadow-md rounded-2xl overflow-hidden">
                            <CardHeader className="bg-primary/5 border-b border-primary/10">
                                <CardTitle className="text-xl font-serif flex items-center gap-2">
                                    <Utensils className="h-5 w-5 text-primary" />
                                    Étapes de préparation
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-border">
                                    {currentRecipe.steps.map((step, i) => {
                                        const isChecked = checkedSteps[`${currentRecipe.id}-${i}`];
                                        return (
                                            <div 
                                                key={i} 
                                                className={cn(
                                                    "p-6 flex gap-4 cursor-pointer transition-colors group",
                                                    isChecked ? "bg-muted/50" : "hover:bg-muted/20"
                                                )}
                                                onClick={() => toggleStep(i)}
                                            >
                                                <div className="flex items-start pt-0.5">
                                                    <Checkbox 
                                                        checked={isChecked}
                                                        className="h-6 w-6 rounded-full border-2 border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                    />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <span className={cn(
                                                        "text-lg leading-relaxed transition-all",
                                                        isChecked ? "text-muted-foreground line-through opacity-50" : "text-foreground"
                                                    )}>
                                                        {step}
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                        
                        {currentRecipeIndex === allRecipesInEvent.length - 1 && (
                            <div className="mt-12 text-center p-8 bg-primary/5 rounded-3xl border border-dashed border-primary/20 animate-in zoom-in duration-500">
                                <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
                                <h3 className="text-2xl font-serif font-bold mb-2">Bon appétit !</h3>
                                <p className="text-muted-foreground">Tu as terminé toutes les recettes de cet événement.</p>
                                <Button onClick={onClose} className="mt-6 rounded-full px-8 h-12 font-bold shadow-lg">
                                    Terminer la session
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
