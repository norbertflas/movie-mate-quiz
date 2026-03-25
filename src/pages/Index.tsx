
import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/sections/HeroSection";
import { StreamingServicesSelector } from "@/components/sections/StreamingServicesSelector";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { TrendingMoviesSection } from "@/components/sections/TrendingMoviesSection";
import { PopularMoviesSection } from "@/components/sections/PopularMoviesSection";
import { useQuery } from "@tanstack/react-query";
import { getTrendingMovies, getPopularMovies } from "@/services/tmdb";
import { Footer } from "@/components/Footer";
import { MouseGlow } from "@/components/effects/MouseGlow";
import { FilmGrain } from "@/components/effects/FilmGrain";
import { DynamicBackground } from "@/components/effects/DynamicBackground";

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
    <div className="min-h-screen relative overflow-x-hidden bg-[#02020a] selection:bg-purple-500/30">
      <DynamicBackground />
      <MouseGlow />
      <FilmGrain />
      
      <div className="relative z-10">
        <Navigation />
        
        <main>
          <HeroSection />
          
          {!trendingLoading && trendingMovies && (
            <TrendingMoviesSection movies={trendingMovies} />
          )}

          <StreamingServicesSelector />

          {!popularLoading && popularMovies && (
            <PopularMoviesSection movies={popularMovies} />
          )}

          <HowItWorks />
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default Index;
