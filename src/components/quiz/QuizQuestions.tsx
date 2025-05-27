
import { SurveyStep } from "@/components/SurveyStep";
import type { QuizQuestionsProps } from "./QuizTypes";
import { useTranslation } from "react-i18next";
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

  // Get options with better fallback logic
  let optionsToUse: string[] = [];
  
  // First try static options
  if (currentQuestion.options && Array.isArray(currentQuestion.options) && currentQuestion.options.length > 0) {
    optionsToUse = [...currentQuestion.options];
    console.log('Using static options:', optionsToUse);
  }
  // Then try dynamic options
  else if (currentQuestion.getDynamicOptions && typeof currentQuestion.getDynamicOptions === 'function') {
    try {
      const dynamicOptions = currentQuestion.getDynamicOptions(answerMap);
      if (dynamicOptions && Array.isArray(dynamicOptions) && dynamicOptions.length > 0) {
        optionsToUse = [...dynamicOptions];
        console.log('Using dynamic options:', optionsToUse);
      }
    } catch (error) {
      console.error('Error getting dynamic options:', error);
    }
  }

  // Enhanced fallback options based on question ID - always ensure we have options
  if (!optionsToUse || optionsToUse.length === 0) {
    console.log('Using fallback options for question:', currentQuestion.id);
    
    switch (currentQuestion.id) {
      case "platforms":
        optionsToUse = ["Netflix", "Disney+", "Amazon Prime Video", "HBO Max", "Hulu", "Apple TV+", "Paramount+", "YouTube Premium"];
        break;
      case "genres":
        optionsToUse = ["Action", "Adventure", "Comedy", "Drama", "Horror", "Sci-Fi", "Romance", "Thriller", "Documentary", "Animation"];
        break;
      case "mood":
        optionsToUse = ["Relaxed", "Excited", "Thoughtful", "Adventurous", "Romantic", "Scary", "Funny", "Dramatic"];
        break;
      case "decade":
        optionsToUse = ["2020s", "2010s", "2000s", "1990s", "1980s", "1970s", "1960s", "Older"];
        break;
      case "length":
        optionsToUse = ["Short (< 90 min)", "Medium (90-120 min)", "Long (> 120 min)", "Any length"];
        break;
      case "rating":
        optionsToUse = ["G - Family friendly", "PG - Parental guidance", "PG-13 - Teen suitable", "R - Adult content", "NC-17 - Adults only", "Any rating"];
        break;
      case "language":
        optionsToUse = ["English", "Polish", "Spanish", "French", "German", "Italian", "Japanese", "Korean", "Any language"];
        break;
      case "type":
        optionsToUse = ["Movies", "TV Series", "Documentaries", "Both"];
        break;
      case "companions":
        optionsToUse = ["Alone", "With partner", "With family", "With friends", "With kids"];
        break;
      case "time":
        optionsToUse = ["Morning", "Afternoon", "Evening", "Late night", "Weekend"];
        break;
      default:
        // Force options for any unknown question type
        optionsToUse = ["Yes", "No", "Maybe", "I don't know"];
        break;
    }
  }

  // Final safety check - always ensure we have at least basic options
  if (!optionsToUse || optionsToUse.length === 0) {
    console.warn('Still no options! Using emergency fallback');
    optionsToUse = ["Option 1", "Option 2", "Option 3", "Option 4"];
  }

  console.log('Final options to use:', optionsToUse);

  // Skip translation for certain question types that have proper names
  const skipTranslation = ["platforms"].includes(currentQuestion.id);
  
  // Translate options if needed
  const translatedOptions = skipTranslation ? optionsToUse : optionsToUse.map(option => {
    // Create a safe translation key
    const safeOption = option.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, ''); // Remove spaces
    
    const translationKey = `quiz.options.${safeOption}`;
    const translated = t(translationKey, option);
    console.log(`Translating: ${option} -> ${translated} (key: ${translationKey})`);
    return translated;
  });
  
  const questionText = t(currentQuestion.question, currentQuestion.question);
  const subtitleText = currentQuestion.subtitle ? t(currentQuestion.subtitle, currentQuestion.subtitle) : "";

  console.log(`[Quiz] Rendering question: ${currentQuestion.question} -> ${questionText}`);
  console.log(`[Quiz] Current language: ${i18n.language}`);
  console.log(`[Quiz] Final translated options:`, translatedOptions);

  // Final check before rendering - this should never happen now
  if (translatedOptions.length === 0) {
    console.error('CRITICAL: No options after all fallbacks!');
    return (
      <div className="text-center text-red-500 p-8">
        <p className="mb-4 text-lg">⚠️ Critical Error: No options available</p>
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
            originalOptions: currentQuestion.options,
            finalOptions: optionsToUse,
            translatedOptions
          }, null, 2)}</pre>
        </div>
        <button 
          onClick={() => onAnswer("Emergency Answer")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Skip Question
        </button>
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
              Options count: {translatedOptions.length} | Question: {currentQuestion.id} | Step: {currentStep}
              <br />
              Options: {translatedOptions.join(', ')}
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
