
import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/sections/HeroSection";
import { StreamingServicesSelector } from "@/components/sections/StreamingServicesSelector";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { TrendingMoviesSection } from "@/components/sections/TrendingMoviesSection";
import { PopularMoviesSection } from "@/components/sections/PopularMoviesSection";
import { useQuery } from "@tanstack/react-query";
import { getTrendingMovies, getPopularMovies } from "@/services/tmdb";
import { Footer } from "@/components/Footer";

const Index = () => {
  const { data: trendingMovies, isLoading: trendingLoading } = useQuery({
    queryKey: ['trendingMovies'],
    queryFn: () => getTrendingMovies({ queryKey: ['trendingMovies'] }),
  });

  const { data: popularMovies, isLoading: popularLoading } = useQuery({
    queryKey: ['popularMovies'],
    queryFn: () => getPopularMovies({ queryKey: ['popularMovies'] }),
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="pt-16 flex-grow">
        <HeroSection />
        <StreamingServicesSelector />
        <HowItWorks />

        <div className="space-y-8 pb-12">
          {!trendingLoading && trendingMovies && (
            <TrendingMoviesSection movies={trendingMovies} />
          )}
          
          {!popularLoading && popularMovies && (
            <PopularMoviesSection movies={popularMovies} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
