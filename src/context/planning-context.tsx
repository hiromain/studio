
"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';
import type { PlannedMeal, MealSlot, MealType } from '@/lib/types';
import { format } from 'date-fns';

const LOCAL_STORAGE_KEY = 'mon_planning';

interface PlanningContextType {
  plannedMeals: PlannedMeal[];
  addRecipeToPlan: (date: Date, meal: MealSlot, recipeId: string, mealType: MealType) => void;
  removeRecipeFromPlan: (date: Date, meal: MealSlot, recipeId: string, mealType: MealType) => void;
  getPlanForDate: (date: Date) => PlannedMeal[];
  isLoading: boolean;
}

const PlanningContext = createContext<PlanningContextType | undefined>(undefined);

export const PlanningProvider = ({ children }: { children: ReactNode }) => {
  const [plannedMeals, setPlannedMeals] = useState<PlannedMeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedPlanning = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedPlanning) {
        setPlannedMeals(JSON.parse(storedPlanning));
      }
    } catch (error) {
      console.error("Failed to load planning from local storage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(plannedMeals));
      } catch (error) {
        console.error("Failed to save planning to local storage", error);
      }
    }
  }, [plannedMeals, isLoading]);

  const addRecipeToPlan = useCallback((date: Date, mealSlot: MealSlot, recipeId: string, mealType: MealType) => {
    const dateString = format(date, 'yyyy-MM-dd');
    
    setPlannedMeals(prev => {
        const newPlannedMeals = [...prev];
        let mealPlan = newPlannedMeals.find(p => p.date === dateString && p.meal === mealSlot);

        if (mealPlan) {
            // Check if recipe already exists for this meal type
            const recipeExists = mealPlan.recipes.some(r => r.recipeId === recipeId && r.mealType === mealType);
            if (!recipeExists) {
                mealPlan.recipes.push({ recipeId, mealType });
            }
        } else {
            newPlannedMeals.push({
                date: dateString,
                meal: mealSlot,
                recipes: [{ recipeId, mealType }],
            });
        }
        return newPlannedMeals;
    });
  }, []);

  const removeRecipeFromPlan = useCallback((date: Date, mealSlot: MealSlot, recipeId: string, mealType: MealType) => {
    const dateString = format(date, 'yyyy-MM-dd');
    setPlannedMeals(prev => {
        const newPlannedMeals = prev.map(plan => {
            if (plan.date === dateString && plan.meal === mealSlot) {
                return {
                    ...plan,
                    recipes: plan.recipes.filter(r => !(r.recipeId === recipeId && r.mealType === mealType))
                };
            }
            return plan;
        }).filter(plan => plan.recipes.length > 0); // Remove meal if it becomes empty
        return newPlannedMeals;
    });
  }, []);


  const getPlanForDate = useCallback((date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return plannedMeals.filter(p => p.date === dateString);
  }, [plannedMeals]);


  const value = useMemo(() => ({
    plannedMeals,
    addRecipeToPlan,
    removeRecipeFromPlan,
    getPlanForDate,
    isLoading
  }), [plannedMeals, addRecipeToPlan, removeRecipeFromPlan, getPlanForDate, isLoading]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-primary font-headline text-2xl">Chargement du planning...</div>
      </div>
    );
  }

  return (
    <PlanningContext.Provider value={value}>
      {children}
    </PlanningContext.Provider>
  );
};

export const usePlanning = () => {
  const context = useContext(PlanningContext);
  if (context === undefined) {
    throw new Error('usePlanning must be used within a PlanningProvider');
  }
  return context;
};

