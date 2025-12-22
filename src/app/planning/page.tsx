
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { addDays, format, startOfWeek, eachDayOfInterval, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { usePlanning } from '@/context/planning-context';
import { useRecipes } from '@/context/recipe-context';
import type { MealSlot, MealType, PlannedMeal, PlannedEvent } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MEAL_TYPES } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { X, PlusCircle, ChevronLeft, ChevronRight, CalendarDays, PartyPopper, Trash2, Pencil } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

export default function PlanningPage() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
       <Tabs defaultValue="calendar" className="w-full">
        <div className="flex justify-center mb-8">
            <TabsList className="grid grid-cols-2 w-full max-w-md">
                <TabsTrigger value="calendar"><CalendarDays className="mr-2 h-4 w-4"/>Calendrier</TabsTrigger>
                <TabsTrigger value="events"><PartyPopper className="mr-2 h-4 w-4"/>Événements</TabsTrigger>
            </TabsList>
        </div>
        <TabsContent value="calendar">
            <CalendarView />
        </TabsContent>
        <TabsContent value="events">
            <EventsView />
        </TabsContent>
        </Tabs>
    </div>
  );
}

function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'day'>('week');
  
  const start = startOfWeek(currentDate, { locale: fr });
  const weekDays = eachDayOfInterval({ start, end: addDays(start, 6) });
  
  const goToPrevious = () => {
    setCurrentDate(addDays(currentDate, view === 'week' ? -7 : -1));
  };
  
  const goToNext = () => {
    setCurrentDate(addDays(currentDate, view === 'week' ? 7 : 1));
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  }

  const daysToShow = view === 'week' ? weekDays : [currentDate];

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={goToToday}>Aujourd'hui</Button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={goToPrevious}><ChevronLeft className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" onClick={goToNext}><ChevronRight className="h-5 w-5" /></Button>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-headline text-foreground capitalize">
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
    </>
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

function MealSection({ date, meal, plan, eventId }: { date: Date; meal: MealSlot; plan?: PlannedMeal, eventId?: string }) {
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
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => removeRecipeFromPlan(date, meal, recipeId, mealType, eventId)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground text-center py-2">Aucun plat planifié.</p>
        )}
      </div>
      <AddRecipeDialog date={date} meal={meal} eventId={eventId}>
        <Button variant="ghost" className="w-full mt-2">
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter
        </Button>
      </AddRecipeDialog>
    </div>
  );
}

function AddRecipeDialog({ date, meal, children, eventId }: { date: Date; meal: MealSlot, children: React.ReactNode, eventId?: string }) {
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
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Ajouter une recette pour le {meal.toLowerCase()} du {format(date, 'd MMMM', { locale: fr })}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <Label>Recette</Label>
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
                        <Label>Type de plat</Label>
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

// ---- Event Components ----

function EventsView() {
    const { plannedEvents, removeEvent } = usePlanning();
    const router = useRouter();

    const handleCreateEvent = (newEvent: PlannedEvent) => {
        router.push(`/planning/events/${newEvent.id}`);
    }
    
    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold font-headline">Vos Événements</h2>
                <p className="text-muted-foreground mt-2">Planifiez vos repas pour des occasions spéciales.</p>
            </div>

            <div className="flex justify-center">
                <AddEventDialog onEventCreated={handleCreateEvent}>
                    <Button size="lg">
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Créer un événement
                    </Button>
                </AddEventDialog>
            </div>

            {plannedEvents.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plannedEvents.map(event => (
                        <Card key={event.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="font-headline flex justify-between items-start">
                                    {event.name}
                                    <div className="flex gap-1">
                                        <AddEventDialog existingEvent={event}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </AddEventDialog>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => removeEvent(event.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardTitle>
                                <CardDescription>
                                    {event.duration} jour{event.duration > 1 ? 's' : ''} à partir du {format(parseISO(event.startDate), 'd MMMM yyyy', { locale: fr })}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col justify-end">
                                <Button asChild className="w-full">
                                    <Link href={`/planning/events/${event.id}`}>Planifier les repas</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                 </div>
            ) : (
                <div className="text-center py-16 border-dashed border-2 rounded-lg">
                    <PartyPopper className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">Aucun événement planifié</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Créez votre premier événement pour commencer.</p>
                </div>
            )}
        </div>
    )
}

function AddEventDialog({ children, onEventCreated, existingEvent }: { children: React.ReactNode, onEventCreated?: (event: PlannedEvent) => void, existingEvent?: PlannedEvent }) {
  const { addEvent, updateEvent } = usePlanning();
  const [name, setName] = useState(existingEvent?.name ?? "");
  const [startDate, setStartDate] = useState<Date | undefined>(existingEvent ? parseISO(existingEvent.startDate) : new Date());
  const [duration, setDuration] = useState(existingEvent?.duration ?? 1);
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    if (name.trim() && startDate && duration > 0) {
      if (existingEvent) {
          updateEvent({ id: existingEvent.id, name: name.trim(), startDate: format(startDate, 'yyyy-MM-dd'), duration });
      } else {
          const newEvent = addEvent(name.trim(), startDate, duration);
          onEventCreated?.(newEvent);
      }
      setIsOpen(false);
      // Reset form for next time if it was a new event
      if(!existingEvent) {
          setName("");
          setStartDate(new Date());
          setDuration(1);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{existingEvent ? "Modifier l'événement" : "Créer un événement"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Nom</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" placeholder="Ex: Week-end à la mer"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Début</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="col-span-3 font-normal justify-start">
                           <CalendarDays className="mr-2 h-4 w-4"/>
                           {startDate ? format(startDate, 'd MMMM yyyy', { locale: fr}) : "Choisir une date"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                    </PopoverContent>
                </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-right">Durée (jours)</Label>
                <Input id="duration" type="number" value={duration} onChange={e => setDuration(Math.max(1, parseInt(e.target.value, 10) || 1))} className="col-span-3"/>
            </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={!name.trim() || !startDate || duration <= 0}>{existingEvent ? "Enregistrer" : "Créer et planifier"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Remove old Event section
// DayColumn, EventSection, AddEventDialog are not used in the new event-centric view.
// They are kept for the calendar view but the event part is removed from DayColumn.
// Let's remove old AddEventDialog and EventSection
// The new AddEventDialog is inside EventsView component
