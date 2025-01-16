import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/hooks/use-theme";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/Navigation";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Suspense, lazy } from "react";
import { LoadingState } from "@/components/LoadingState";

// Lazy load pages for better initial load performance
const Index = lazy(() => import("@/pages/Index"));
const Auth = lazy(() => import("@/pages/Auth"));
const Search = lazy(() => import("@/pages/Search"));
const Favorites = lazy(() => import("@/pages/Favorites"));
const Ratings = lazy(() => import("@/pages/Ratings"));
const Services = lazy(() => import("@/pages/Services"));

// Configure the query client with optimized caching and performance settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
      gcTime: 1000 * 60 * 30, // Cache garbage collection after 30 minutes
      refetchOnWindowFocus: false, // Prevent unnecessary refetches
      retry: 1, // Only retry failed requests once
      networkMode: 'offlineFirst', // Enable offline support
      refetchOnMount: false, // Prevent refetch on component mount
      refetchOnReconnect: false, // Prevent refetch on reconnect
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="dark" storageKey="moviemate-theme">
            <div className="flex min-h-screen flex-col bg-background">
              <Navigation />
              <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <Suspense fallback={<LoadingState />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/ratings" element={<Ratings />} />
                    <Route path="/services" element={<Services />} />
                  </Routes>
                </Suspense>
              </main>
            </div>
            <Toaster />
          </ThemeProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;