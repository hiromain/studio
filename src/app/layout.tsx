import type { Metadata } from 'next';
import { Inter, Alegreya } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { Sidebar } from '@/components/navigation/sidebar';
import { BottomNav } from '@/components/navigation/bottom-nav';
import { BackgroundWrapper } from '@/components/layout/background-wrapper';
import { RecipeProvider } from '@/context/recipe-context';
import { PlanningProvider } from '@/context/planning-context';
import { SettingsProvider } from '@/context/settings-context';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const alegreya = Alegreya({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: 'À table ! 🍲 Ton grimoire de cuisine',
  description: 'Gère tes recettes et planifie tes festins sans te prendre le chou.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} ${alegreya.variable} font-sans antialiased min-h-screen bg-background text-foreground`}>
        <FirebaseClientProvider>
          <SettingsProvider>
            <BackgroundWrapper />
            <RecipeProvider>
              <PlanningProvider>
                <div className="flex min-h-screen">
                  {/* Sidebar Desktop */}
                  <Sidebar />

                  {/* Main Content */}
                  <div className="flex-1 lg:pl-72">
                    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-6">
                      {children}
                    </main>
                  </div>

                  {/* Bottom Navigation Mobile */}
                  <BottomNav />
                </div>
                <Toaster />
              </PlanningProvider>
            </RecipeProvider>
          </SettingsProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
