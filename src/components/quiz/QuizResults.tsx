import { motion } from "framer-motion";
import { MovieCard } from "../MovieCard";
import { Card } from "../ui/card";
import { useQuizLogic } from "./QuizLogic";

interface QuizResultsProps {
  isGroupQuiz?: boolean;
}

export const QuizResults = ({ isGroupQuiz }: QuizResultsProps) => {
  const { recommendations } = useQuizLogic();

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
          <div key={movie.title} className="space-y-4">
            <MovieCard {...movie} />
            {movie.explanations && movie.explanations.length > 0 && (
              <Card className="p-4 bg-muted/50 backdrop-blur">
                <h3 className="font-medium mb-2 text-sm">Dlaczego to polecamy:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {movie.explanations.map((explanation, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {explanation}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};