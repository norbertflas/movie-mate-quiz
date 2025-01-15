import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/hooks/use-theme";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/Navigation";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Search from "@/pages/Search";
import Favorites from "@/pages/Favorites";
import Ratings from "@/pages/Ratings";

// Configure the query client with caching and performance optimizations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
      gcTime: 1000 * 60 * 30, // Cache garbage collection after 30 minutes
      refetchOnWindowFocus: false, // Prevent unnecessary refetches
      retry: 1, // Only retry failed requests once
      networkMode: 'offlineFirst', // Enable offline support
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="dark" storageKey="moviemate-theme">
            <Navigation />
            <main className="min-h-screen bg-background">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/search" element={<Search />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/ratings" element={<Ratings />} />
              </Routes>
            </main>
            <Toaster />
          </ThemeProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;