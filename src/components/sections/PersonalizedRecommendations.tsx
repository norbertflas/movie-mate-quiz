import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

interface PersonalizedRecommendationsProps {
  userPreferences?: any;
  trendingMovies?: any[];
  popularMovies?: any[];
}

export const PersonalizedRecommendations = ({ 
  userPreferences, 
  trendingMovies = [], 
  popularMovies = [] 
}: PersonalizedRecommendationsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Personalized Recommendations</h2>
        <p className="text-muted-foreground">
          Based on your preferences, here are some movies you might enjoy.
        </p>
        {/* Placeholder for personalized content */}
        <div className="mt-4 text-sm text-muted-foreground">
          {userPreferences?.hasCompletedOnboarding 
            ? `Showing recommendations based on your quiz results` 
            : 'Complete the quiz to get personalized recommendations'}
        </div>
      </Card>
    </motion.div>
  );
};
