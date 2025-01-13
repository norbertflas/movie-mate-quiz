import { useState } from "react";
import { SurveyStep } from "./SurveyStep";
import { MovieCard } from "./MovieCard";
import { motion, AnimatePresence } from "framer-motion";
import { VOD_SERVICES, SURVEY_STEPS } from "./quiz/QuizConstants";
import { getRecommendations } from "./quiz/QuizLogic";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";
import type { SurveyStepType } from "./quiz/QuizTypes";

interface QuizSectionProps {
  onSubmit?: (answers: Record<string, any>) => void;
}

export const QuizSection = ({ onSubmit }: QuizSectionProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const handleSelect = (option: string) => {
    const currentQuestion = SURVEY_STEPS[currentStep];

    if (currentQuestion.type === "multiple") {
      if (option === "NEXT_STEP") {
        handleNextStep();
      } else {
        const currentAnswers = answers[currentQuestion.id] || [];
        const updatedAnswers = currentAnswers.includes(option)
          ? currentAnswers.filter((item: string) => item !== option)
          : [...currentAnswers, option];

        setAnswers({
          ...answers,
          [currentQuestion.id]: updatedAnswers,
        });
      }
    } else {
      setAnswers({
        ...answers,
        [currentQuestion.id]: option,
      });
      handleNextStep();
    }
  };

  const handleNextStep = () => {
    if (currentStep < SURVEY_STEPS.length - 1) {
      const nextStep = currentStep + 1;
      const nextQuestion = SURVEY_STEPS[nextStep];
      if (nextQuestion.shouldShow && !nextQuestion.shouldShow(answers)) {
        setCurrentStep(nextStep + 1);
      } else {
        setCurrentStep(nextStep);
      }
    } else {
      finishQuiz();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const finishQuiz = async () => {
    setShowResults(true);
    onSubmit?.(answers);

    try {
      const user = await supabase.auth.getUser();
      if (user.data.user) {
        // Save quiz history
        await supabase.from('quiz_history').insert({
          user_id: user.data.user.id,
          answers
        });

        // Get recommendations with explanations
        const recommendations = getRecommendations(answers);
        
        toast({
          title: "Quiz zakończony",
          description: "Twoje odpowiedzi zostały zapisane",
        });
      }
    } catch (error) {
      console.error('Error saving quiz results:', error);
    }
  };

  const currentQuestion = SURVEY_STEPS[currentStep];
  const options = currentQuestion.getDynamicOptions
    ? currentQuestion.getDynamicOptions(answers)
    : currentQuestion.options;

  const progress = ((currentStep + 1) / SURVEY_STEPS.length) * 100;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {!showResults ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground text-right">
                  Krok {currentStep + 1} z {SURVEY_STEPS.length}
                </p>
              </div>
              <SurveyStep
                key={currentStep}
                question={currentQuestion.question}
                options={options}
                onSelect={handleSelect}
                currentStep={currentStep + 1}
                totalSteps={SURVEY_STEPS.length}
                type={currentQuestion.type}
                selectedOptions={answers[currentQuestion.id] || []}
              />
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="mt-4"
                >
                  Wróć
                </Button>
              )}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-semibold tracking-tight mb-6">
                Twoje rekomendacje:
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getRecommendations(answers).map((movie) => (
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
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};