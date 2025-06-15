
import { Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Index from './pages/Index';
import Search from './pages/Search';
import { QuizContent } from './components/home/QuizContent';
import Favorites from './pages/Favorites';
import Ratings from './pages/Ratings';
import Services from './pages/Services';
import Auth from './pages/Auth';
import About from './pages/About';
import Contact from './pages/Contact';
import Careers from './pages/Careers';
import Press from './pages/Press';
import Help from './pages/Help';
import FAQ from './pages/FAQ';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Copyright from './pages/Copyright';
import Cookies from './pages/Cookies';
import Refunds from './pages/Refunds';
import QuickStart from './pages/QuickStart';
import UserGuide from './pages/UserGuide';
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
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/press" element={<Press />} />
              <Route path="/help" element={<Help />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/copyright" element={<Copyright />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/refunds" element={<Refunds />} />
              <Route path="/quick-start" element={<QuickStart />} />
              <Route path="/user-guide" element={<UserGuide />} />
            </Routes>
          </main>
        </ScrollProvider>
      </div>
    </HelmetProvider>
  );
}

export default App;
