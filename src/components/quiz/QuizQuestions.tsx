
import { SurveyStep } from "@/components/SurveyStep";
import type { QuizQuestionsProps } from "./QuizTypes";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { motion } from "framer-motion";

export const QuizQuestions = ({ questions, currentStep, onAnswer, answers, answerMap }: QuizQuestionsProps) => {
  const { t } = useTranslation();
  const currentQuestion = questions[currentStep];

  if (!currentQuestion) {
    console.error('No question found for step:', currentStep);
    return null;
  }

  // Get the current answer if it exists
  const currentAnswer = answers.find(a => a.questionId === currentQuestion.id)?.answer;
  
  // Check if this question should be shown based on previous answers
  if (currentQuestion.shouldShow && !currentQuestion.shouldShow(answerMap)) {
    return null;
  }

  // Translate options before passing them to SurveyStep
  const translatedOptions = currentQuestion.options.map(option => {
    // For platform names which shouldn't be translated
    if (currentQuestion.id === "platforms") {
      return option;
    }
    return t(option);
  });
  
  const questionText = t(currentQuestion.question);
  const subtitleText = currentQuestion.subtitle ? t(currentQuestion.subtitle) : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full bg-black text-white"
    >
      <div className="relative">
        {/* Close button */}
        <button className="absolute left-0 top-0 p-4 text-gray-400 hover:text-white">
          <X className="h-6 w-6" />
        </button>
        
        <div className="py-12 px-6">
          {/* Question */}
          <h2 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
            {questionText}
          </h2>
          <p className="text-gray-400 mb-8">{subtitleText}</p>
          
          {/* Options */}
          <div className="max-w-4xl mx-auto">
            <SurveyStep
              question=""
              options={translatedOptions}
              onSelect={onAnswer}
              currentStep={currentStep + 1}
              totalSteps={questions.filter(q => !q.shouldShow || q.shouldShow(answerMap)).length}
              type={currentQuestion.type}
              selectedOptions={currentAnswer ? [currentAnswer] : []}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
