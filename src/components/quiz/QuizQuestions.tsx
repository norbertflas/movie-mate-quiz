
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
    answersLength: answers.length,
    currentQuestionOptions: currentQuestion?.options,
    language: i18n.language
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

  // Get options - handle all cases
  let optionsToUse: string[] = [];
  
  // First try static options
  if (currentQuestion.options && Array.isArray(currentQuestion.options) && currentQuestion.options.length > 0) {
    optionsToUse = currentQuestion.options;
    console.log('Using static options:', optionsToUse);
  }
  // Then try dynamic options
  else if (currentQuestion.getDynamicOptions && typeof currentQuestion.getDynamicOptions === 'function') {
    try {
      optionsToUse = currentQuestion.getDynamicOptions(answerMap);
      console.log('Using dynamic options:', optionsToUse);
    } catch (error) {
      console.error('Error getting dynamic options:', error);
      optionsToUse = [];
    }
  }

  // Fallback options based on question ID
  if (!optionsToUse || optionsToUse.length === 0) {
    console.log('Using fallback options for question:', currentQuestion.id);
    
    switch (currentQuestion.id) {
      case "platforms":
        optionsToUse = ["Netflix", "Disney+", "Amazon Prime", "HBO Max", "Hulu", "Apple TV+", "Paramount+"];
        break;
      case "genres":
        optionsToUse = ["Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Romance", "Thriller", "Documentary"];
        break;
      case "mood":
        optionsToUse = ["Relaxed", "Excited", "Thoughtful", "Adventurous", "Romantic", "Scary"];
        break;
      case "decade":
        optionsToUse = ["2020s", "2010s", "2000s", "1990s", "1980s", "1970s", "Older"];
        break;
      case "length":
        optionsToUse = ["Short (< 90 min)", "Medium (90-120 min)", "Long (> 120 min)", "Any length"];
        break;
      case "rating":
        optionsToUse = ["G - Family friendly", "PG - Parental guidance", "PG-13 - Teen suitable", "R - Adult content", "Any rating"];
        break;
      default:
        optionsToUse = ["Yes", "No", "Maybe"];
        break;
    }
  }

  console.log('Final options to use:', optionsToUse);

  // Skip translation for certain question types
  const skipTranslation = ["platforms", "genres"].includes(currentQuestion.id);
  
  // Translate options if needed
  const translatedOptions = skipTranslation ? optionsToUse : optionsToUse.map(option => {
    const translationKey = `quiz.options.${option.toLowerCase().replace(/\s+/g, '')}`;
    const translated = t(translationKey, option);
    console.log(`Translating: ${option} -> ${translated}`);
    return translated;
  });
  
  const questionText = t(currentQuestion.question, currentQuestion.question);
  const subtitleText = currentQuestion.subtitle ? t(currentQuestion.subtitle, currentQuestion.subtitle) : "";

  console.log(`[Quiz] Rendering question: ${currentQuestion.question} -> ${questionText}`);
  console.log(`[Quiz] Current language: ${i18n.language}`);
  console.log(`[Quiz] Final translated options:`, translatedOptions);

  if (translatedOptions.length === 0) {
    console.warn('No options available for question:', currentQuestion.id);
    return (
      <div className="text-center text-yellow-500 p-8">
        <p className="mb-4">Warning: No options available for this question</p>
        <p className="text-sm">Question ID: {currentQuestion.id}</p>
        <p className="text-sm">Question Type: {currentQuestion.type}</p>
        <div className="mt-4 p-4 bg-gray-800 rounded text-left">
          <p className="text-xs text-gray-400">Debug info:</p>
          <pre className="text-xs text-gray-300">{JSON.stringify({
            questionId: currentQuestion.id,
            hasStaticOptions: !!currentQuestion.options,
            staticOptionsLength: currentQuestion.options?.length || 0,
            hasDynamicOptions: !!currentQuestion.getDynamicOptions,
            answerMapKeys: Object.keys(answerMap || {}),
          }, null, 2)}</pre>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full bg-black text-white min-h-screen"
    >
      <div className="relative">
        <div className="py-8 px-4 max-w-4xl mx-auto">
          {/* Question */}
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
            {questionText}
          </h2>
          {subtitleText && (
            <p className="text-gray-400 mb-8 text-lg">{subtitleText}</p>
          )}
          
          {/* Debug info in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-2 bg-gray-800 rounded text-xs text-gray-400">
              Options count: {translatedOptions.length} | Question: {currentQuestion.id}
            </div>
          )}
          
          {/* Options */}
          <div className="w-full">
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
