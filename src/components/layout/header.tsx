"use client";

import Link from 'next/link';
import { ChefHat, PlusCircle, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <Link href="/" className="flex items-center space-x-2">
          <ChefHat className="h-8 w-8 text-primary" />
          <span className="font-headline text-2xl font-bold text-primary">
            A table !
          </span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <Button asChild variant="ghost">
              <Link href="/planning">
                <CalendarDays className="mr-2 h-4 w-4" />
                Planning
              </Link>
            </Button>
            <Button asChild>
              <Link href="/recipes/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Ajouter une Recette
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
