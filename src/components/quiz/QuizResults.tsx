import { motion } from "framer-motion";
import { MovieCard } from "../MovieCard";
import type { MovieRecommendation, QuizResultsProps } from "./QuizTypes";

export const QuizResults = ({ recommendations, isGroupQuiz }: QuizResultsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-semibold tracking-tight mb-6">
        {isGroupQuiz ? "Rekomendacje grupowe:" : "Twoje rekomendacje:"}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((movie) => (
          <div key={movie.title} className="space-y-2">
            <MovieCard {...movie} />
            {movie.explanations && (
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Dlaczego to polecamy:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {movie.explanations.map((explanation, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {explanation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};