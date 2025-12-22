
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { addDays, format, startOfWeek, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { usePlanning } from '@/context/planning-context';
import { useRecipes } from '@/context/recipe-context';
import type { MealSlot, MealType, PlannedMeal } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MEAL_TYPES } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, PlusCircle, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function PlanningPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'day'>('week');
  
  const start = startOfWeek(currentDate, { locale: fr });
  const weekDays = eachDayOfInterval({ start, end: addDays(start, 6) });
  
  const goToPrevious = () => {
    if (view === 'week') {
      setCurrentDate(addDays(currentDate, -7));
    } else {
      setCurrentDate(addDays(currentDate, -1));
    }
  };
  
  const goToNext = () => {
    if (view === 'week') {
      setCurrentDate(addDays(currentDate, 7));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  }

  const daysToShow = view === 'week' ? weekDays : [currentDate];

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={goToToday}>Aujourd'hui</Button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={goToPrevious}><ChevronLeft className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" onClick={goToNext}><ChevronRight className="h-5 w-5" /></Button>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-headline text-foreground">
            {view === 'week' ? format(start, 'MMMM yyyy', { locale: fr }) : format(currentDate, 'd MMMM yyyy', { locale: fr })}
          </h2>
        </div>
        <div className="flex items-center gap-2">
            <Button variant={view === 'day' ? 'secondary' : 'outline'} onClick={() => setView('day')}>Jour</Button>
            <Button variant={view === 'week' ? 'secondary' : 'outline'} onClick={() => setView('week')}>Semaine</Button>
        </div>
      </div>

      <div className={`grid ${view === 'week' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-6`}>
        {daysToShow.map(day => (
          <DayColumn key={day.toString()} date={day} />
        ))}
      </div>
    </div>
  );
}

function DayColumn({ date }: { date: Date }) {
    const { getPlanForDate } = usePlanning();
    const plans = getPlanForDate(date);
    const midiPlan = plans.find(p => p.meal === 'Midi');
    const soirPlan = plans.find(p => p.meal === 'Soir');

    return (
        <Card className="flex flex-col">
            <CardHeader className="text-center">
                <CardTitle className="font-headline text-xl capitalize">
                    {format(date, 'eeee d', { locale: fr })}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
                <MealSection date={date} meal="Midi" plan={midiPlan} />
                <MealSection date={date} meal="Soir" plan={soirPlan} />
            </CardContent>
        </Card>
    );
}

function MealSection({ date, meal, plan }: { date: Date; meal: MealSlot; plan?: PlannedMeal }) {
  const { getRecipeById } = useRecipes();
  const { removeRecipeFromPlan } = usePlanning();

  const sortedRecipes = plan?.recipes.sort((a, b) => MEAL_TYPES.indexOf(a.mealType) - MEAL_TYPES.indexOf(b.mealType));

  return (
    <div className="bg-background/50 p-4 rounded-lg flex-1">
      <h3 className="font-semibold text-lg mb-3">{meal}</h3>
      <div className="space-y-2">
        {sortedRecipes && sortedRecipes.length > 0 ? (
          sortedRecipes.map(({ recipeId, mealType }) => {
            const recipe = getRecipeById(recipeId);
            if (!recipe) return null;
            return (
              <div key={`${recipeId}-${mealType}`} className="group flex justify-between items-center text-sm p-2 rounded-md bg-card">
                <Link href={`/recipes/${recipeId}`} className="flex-1 truncate">
                  <span className="font-medium">{recipe.title}</span>
                  <span className="text-muted-foreground ml-2">({mealType})</span>
                </Link>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => removeRecipeFromPlan(date, meal, recipeId, mealType)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground text-center py-2">Aucun plat planifié.</p>
        )}
      </div>
      <AddRecipeDialog date={date} meal={meal}>
        <Button variant="ghost" className="w-full mt-2">
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter
        </Button>
      </AddRecipeDialog>
    </div>
  );
}


function AddRecipeDialog({ date, meal, children }: { date: Date; meal: MealSlot, children: React.ReactNode }) {
    const { recipes } = useRecipes();
    const { addRecipeToPlan } = usePlanning();
    const [selectedRecipe, setSelectedRecipe] = useState<string | undefined>();
    const [selectedMealType, setSelectedMealType] = useState<MealType | undefined>();
    const [isOpen, setIsOpen] = useState(false);

    const handleAdd = () => {
        if (selectedRecipe && selectedMealType) {
            addRecipeToPlan(date, meal, selectedRecipe, selectedMealType);
            setSelectedRecipe(undefined);
            setSelectedMealType(undefined);
            setIsOpen(false);
        }
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Ajouter une recette pour le {meal.toLowerCase()} du {format(date, 'd MMMM', { locale: fr })}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <label className="text-sm font-medium">Recette</label>
                        <Select onValueChange={setSelectedRecipe} value={selectedRecipe}>
                            <SelectTrigger><SelectValue placeholder="Choisir une recette" /></SelectTrigger>
                            <SelectContent>
                                {recipes.map(recipe => (
                                    <SelectItem key={recipe.id} value={recipe.id}>{recipe.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Type de plat</label>
                        <Select onValueChange={(v) => setSelectedMealType(v as MealType)} value={selectedMealType}>
                             <SelectTrigger><SelectValue placeholder="Choisir le type de plat" /></SelectTrigger>
                            <SelectContent>
                                {MEAL_TYPES.map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Button onClick={handleAdd} disabled={!selectedRecipe || !selectedMealType}>Ajouter au planning</Button>
            </DialogContent>
        </Dialog>
    );
}

