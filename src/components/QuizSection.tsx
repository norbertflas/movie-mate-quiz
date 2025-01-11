import { useState } from "react";
import { SurveyStep } from "./SurveyStep";
import { MovieCard } from "./MovieCard";
import { motion, AnimatePresence } from "framer-motion";
import { VOD_SERVICES, SURVEY_STEPS } from "./quiz/QuizConstants";
import { getRecommendations } from "./quiz/QuizLogic";
import type { SurveyStepType } from "./quiz/QuizTypes";

export const QuizSection = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showResults, setShowResults] = useState(false);

  const handleSelect = (option: string) => {
    const currentQuestion = SURVEY_STEPS[currentStep];

    if (currentQuestion.type === "multiple") {
      if (option === "NEXT_STEP") {
        if (currentStep < SURVEY_STEPS.length - 1) {
          const nextStep = currentStep + 1;
          const nextQuestion = SURVEY_STEPS[nextStep];
          if (nextQuestion.shouldShow && !nextQuestion.shouldShow(answers)) {
            setCurrentStep(nextStep + 1);
          } else {
            setCurrentStep(nextStep);
          }
        } else {
          setShowResults(true);
        }
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

      if (currentStep < SURVEY_STEPS.length - 1) {
        const nextStep = currentStep + 1;
        const nextQuestion = SURVEY_STEPS[nextStep];

        if (nextQuestion.shouldShow && !nextQuestion.shouldShow(answers)) {
          setCurrentStep(nextStep + 1);
        } else {
          setCurrentStep(nextStep);
        }
      } else {
        setShowResults(true);
      }
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
                  <MovieCard key={movie.title} {...movie} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};