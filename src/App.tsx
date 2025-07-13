
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import Index from "./pages/Index";
import { ComprehensiveQuizPage } from "./pages/ComprehensiveQuizPage";
import Search from "./pages/Search";
import Favorites from "./pages/Favorites";
import Ratings from "./pages/Ratings";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import FAQ from "./pages/FAQ";
import Help from "./pages/Help";
import UserGuide from "./pages/UserGuide";
import QuickStart from "./pages/QuickStart";
import Services from "./pages/Services";
import Auth from "./pages/Auth";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/quiz" element={<ComprehensiveQuizPage />} />
              <Route path="/search" element={<Search />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/ratings" element={<Ratings />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/help" element={<Help />} />
              <Route path="/guide" element={<UserGuide />} />
              <Route path="/quickstart" element={<QuickStart />} />
              <Route path="/services" element={<Services />} />
              <Route path="/auth" element={<Auth />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
