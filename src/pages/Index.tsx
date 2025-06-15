
import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/sections/HeroSection";
import { TrendingMoviesSection } from "@/components/sections/TrendingMoviesSection";
import { PopularMoviesSection } from "@/components/sections/PopularMoviesSection";
import { useQuery } from "@tanstack/react-query";
import { getTrendingMovies, getPopularMovies } from "@/services/tmdb";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Footer } from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();

  const { data: trendingMovies, isLoading: trendingLoading } = useQuery({
    queryKey: ['trendingMovies'],
    queryFn: () => getTrendingMovies('week'),
  });

  const { data: popularMovies, isLoading: popularLoading } = useQuery({
    queryKey: ['popularMovies'],
    queryFn: getPopularMovies,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col">
      <Navigation />
      
      <main className="pt-16 flex-grow">
        <HeroSection />
        
        {/* Quiz CTA Section */}
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-8 border border-blue-500/30">
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Can't Decide What to Watch?
              </h2>
              <p className="text-gray-300 text-lg mb-6 max-w-2xl mx-auto">
                Take our personalized quiz to discover movies perfectly matched to your taste and streaming preferences!
              </p>
              <Button
                onClick={() => navigate("/quiz")}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-lg flex items-center gap-2 mx-auto"
              >
                <Zap className="h-5 w-5" />
                Find My Perfect Movie
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        <div className="space-y-12 px-4 pb-12">
          <div className="max-w-7xl mx-auto">
            {!trendingLoading && trendingMovies && (
              <TrendingMoviesSection movies={trendingMovies} />
            )}
          </div>
          
          <div className="max-w-7xl mx-auto">
            {!popularLoading && popularMovies && (
              <PopularMoviesSection movies={popularMovies} />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
