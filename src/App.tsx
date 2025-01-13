import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthLayout } from "./components/layouts/AuthLayout";
import { ThemeProvider } from "./hooks/use-theme";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Search from "./pages/Search";
import Favorites from "./pages/Favorites";
import Ratings from "./pages/Ratings";
import { CreateGroupQuiz } from "./components/quiz/CreateGroupQuiz";
import { GroupQuizView } from "./components/quiz/GroupQuizView";
import "./i18n";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="movie-mate-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<AuthLayout><Index /></AuthLayout>} />
            <Route path="/search" element={<AuthLayout><Search /></AuthLayout>} />
            <Route path="/favorites" element={<AuthLayout><Favorites /></AuthLayout>} />
            <Route path="/ratings" element={<AuthLayout><Ratings /></AuthLayout>} />
            <Route path="/quiz/create-group" element={<AuthLayout><CreateGroupQuiz /></AuthLayout>} />
            <Route path="/quiz/group/:groupId" element={<AuthLayout><GroupQuizView /></AuthLayout>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;