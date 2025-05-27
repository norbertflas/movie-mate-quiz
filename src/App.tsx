
import { Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Index from './pages/Index';
import Search from './pages/Search';
import { QuizContent } from './components/home/QuizContent';
import Favorites from './pages/Favorites';
import Ratings from './pages/Ratings';
import Services from './pages/Services';
import Auth from './pages/Auth';
import { ScrollProvider } from './hooks/use-scroll-context';
import { Navigation } from './components/Navigation';

function App() {
  return (
    <HelmetProvider>
      <div className="min-h-screen bg-background text-foreground">
        <ScrollProvider>
          <Navigation />
          <main className="pt-16">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/quiz" element={<QuizContent />} />
              <Route path="/search" element={<Search />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/ratings" element={<Ratings />} />
              <Route path="/services" element={<Services />} />
              <Route path="/auth" element={<Auth />} />
            </Routes>
          </main>
        </ScrollProvider>
      </div>
    </HelmetProvider>
  );
}

export default App;
