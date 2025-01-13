import { useState } from "react";
import { SurveyStep } from "./SurveyStep";
import { motion, AnimatePresence } from "framer-motion";
import { SURVEY_STEPS } from "./quiz/QuizConstants";
import { getRecommendations } from "./quiz/QuizLogic";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";
import { QuizProgress } from "./quiz/QuizProgress";
import { QuizResults } from "./quiz/QuizResults";

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
        await supabase.from('quiz_history').insert({
          user_id: user.data.user.id,
          answers
        });
        
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

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {!showResults ? (
            <div className="space-y-6">
              <QuizProgress 
                currentStep={currentStep} 
                totalSteps={SURVEY_STEPS.length} 
              />
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
            <QuizResults recommendations={getRecommendations(answers)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};