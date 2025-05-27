
import { SurveyStep } from "@/components/SurveyStep";
import type { QuizQuestionsProps } from "./QuizTypes";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { motion } from "framer-motion";

export const QuizQuestions = ({ questions, currentStep, onAnswer, answers, answerMap }: QuizQuestionsProps) => {
  const { t, i18n } = useTranslation();
  const currentQuestion = questions[currentStep];

  console.log('QuizQuestions rendering:', {
    currentStep,
    questionsLength: questions.length,
    currentQuestion: currentQuestion?.id,
    answersLength: answers.length
  });

  if (!currentQuestion) {
    console.error('No question found for step:', currentStep);
    return (
      <div className="text-center text-red-500">
        <p>Error: No question found for step {currentStep}</p>
      </div>
    );
  }

  // Get the current answer if it exists
  const currentAnswer = answers.find(a => a.questionId === currentQuestion.id)?.answer;
  
  // Check if this question should be shown based on previous answers
  if (currentQuestion.shouldShow && !currentQuestion.shouldShow(answerMap)) {
    console.log('Question should not be shown:', currentQuestion.id);
    return null;
  }

  // Get dynamic options if available
  let optionsToUse = currentQuestion.options || [];
  if (currentQuestion.getDynamicOptions && optionsToUse.length === 0) {
    optionsToUse = currentQuestion.getDynamicOptions(answerMap);
  }

  console.log('Options to use:', optionsToUse);

  // Translate options before passing them to SurveyStep
  const translatedOptions = optionsToUse.map(option => {
    // For platform names which shouldn't be translated
    if (currentQuestion.id === "platforms") {
      return option;
    }
    
    // For genre names which shouldn't be translated
    if (currentQuestion.id === "genres") {
      return option;
    }
    
    // For other options, use translation keys
    const translationKey = `quiz.options.${option}`;
    return t(translationKey, option);
  });
  
  const questionText = t(currentQuestion.question, currentQuestion.question);
  const subtitleText = currentQuestion.subtitle ? t(currentQuestion.subtitle, currentQuestion.subtitle) : "";

  console.log(`[Quiz] Rendering question: ${currentQuestion.question} -> ${questionText}`);
  console.log(`[Quiz] Current language: ${i18n.language}`);
  console.log(`[Quiz] Translated options:`, translatedOptions);

  if (translatedOptions.length === 0) {
    console.warn('No options available for question:', currentQuestion.id);
    return (
      <div className="text-center text-yellow-500">
        <p>Warning: No options available for this question</p>
        <p>Question ID: {currentQuestion.id}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full bg-black text-white"
    >
      <div className="relative">
        <div className="py-8 px-4">
          {/* Question */}
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
            {questionText}
          </h2>
          {subtitleText && (
            <p className="text-gray-400 mb-6">{subtitleText}</p>
          )}
          
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
