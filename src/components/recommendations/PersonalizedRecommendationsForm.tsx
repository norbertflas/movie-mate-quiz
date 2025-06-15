import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles, Play, Star, Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  genre: string;
  trailer_url?: string;
  explanations?: string[];
}

const POPULAR_MOVIES = [
  { id: 550, title: "Fight Club", genres: [18, 53] },
  { id: 13, title: "Forrest Gump", genres: [35, 18, 10749] },
  { id: 155, title: "The Dark Knight", genres: [18, 28, 80, 53] },
  { id: 122, title: "The Lord of the Rings: The Return of the King", genres: [12, 18, 14] },
  { id: 680, title: "Pulp Fiction", genres: [53, 80] },
  { id: 389, title: "12 Angry Men", genres: [18] },
  { id: 19404, title: "Dilwale Dulhania Le Jayenge", genres: [35, 18, 10749] },
  { id: 278, title: "The Shawshank Redemption", genres: [18, 80] },
  { id: 424, title: "Schindler's List", genres: [18, 36, 10752] },
  { id: 372058, title: "Your Name.", genres: [10749, 16, 18] }
];

export const PersonalizedRecommendationsForm = () => {
  const [prompt, setPrompt] = useState("");
  const [selectedMovies, setSelectedMovies] = useState<typeof POPULAR_MOVIES>([]);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingFilter, setStreamingFilter] = useState<string>("");
  const { toast } = useToast();

  const handleMovieToggle = (movie: typeof POPULAR_MOVIES[0]) => {
    setSelectedMovies(prev => {
      const isSelected = prev.some(m => m.id === movie.id);
      if (isSelected) {
        return prev.filter(m => m.id !== movie.id);
      } else if (prev.length < 5) {
        return [...prev, movie];
      } else {
        toast({
          title: "Limit reached",
          description: "You can select up to 5 movies",
          variant: "destructive"
        });
        return prev;
      }
    });
  };

  const handleSubmit = async () => {
    if (!prompt.trim() && selectedMovies.length === 0) {
      toast({
        title: "Error",
        description: "Please describe what you're looking for or select movies you like",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Sending recommendation request:', { prompt, selectedMovies });
      
      const { data, error } = await supabase.functions.invoke('get-personalized-recommendations', {
        body: {
          prompt: prompt.trim(),
          selectedMovies: selectedMovies
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Error getting recommendations');
      }

      console.log('Received recommendations:', data);

      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error('No recommendations in response');
      }

      setRecommendations(data);
      toast({
        title: "Success!",
        description: `Found ${data.length} recommendations for you`,
      });

    } catch (error) {
      console.error('Error getting recommendations:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get recommendations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const streamingServices = ["Netflix", "Disney+", "Amazon Prime", "HBO Max", "Apple TV+"];
  
  const filteredRecommendations = streamingFilter 
    ? recommendations.filter(movie => 
        movie.explanations?.some(exp => 
          exp.toLowerCase().includes(streamingFilter.toLowerCase())
        )
      )
    : recommendations;

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Describe what you're looking for
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="For example: 'I want to watch something like Inception but with better humor' or 'Looking for a 90s action movie' or 'Something romantic for tonight'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px]"
          />
          
          <div>
            <p className="text-sm font-medium mb-3">
              Or select movies you like ({selectedMovies.length}/5):
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {POPULAR_MOVIES.map((movie) => (
                <Button
                  key={movie.id}
                  variant={selectedMovies.some(m => m.id === movie.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleMovieToggle(movie)}
                  className="text-xs h-auto p-2 text-center"
                >
                  {movie.title}
                </Button>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleSubmit}
            disabled={isLoading || (!prompt.trim() && selectedMovies.length === 0)}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Getting recommendations...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Show Recommendations
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Streaming Filter */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter by streaming service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={streamingFilter === "" ? "default" : "outline"}
                size="sm"
                onClick={() => setStreamingFilter("")}
              >
                All
              </Button>
              {streamingServices.map((service) => (
                <Button
                  key={service}
                  variant={streamingFilter === service ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStreamingFilter(service)}
                >
                  {service}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {filteredRecommendations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">
            Your recommendations ({filteredRecommendations.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRecommendations.map((movie, index) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      {movie.poster_path && (
                        <img
                          src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                          alt={movie.title}
                          className="w-16 h-24 object-cover rounded flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm line-clamp-2 mb-1">
                          {movie.title}
                        </h4>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          {movie.release_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(movie.release_date).getFullYear()}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {Math.round(movie.vote_average * 10) / 10}
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-3 mb-2">
                          {movie.overview}
                        </p>
                        
                        {movie.explanations && movie.explanations.length > 0 && (
                          <div className="space-y-1">
                            {movie.explanations.slice(0, 2).map((explanation, idx) => (
                              <Badge 
                                key={idx} 
                                variant="secondary" 
                                className="text-xs py-0.5 px-1.5"
                              >
                                {explanation}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
