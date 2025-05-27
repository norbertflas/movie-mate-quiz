
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

  // Get options with guaranteed fallbacks
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

  // GUARANTEED fallback options based on question ID
  if (!optionsToUse || optionsToUse.length === 0) {
    console.log('Using GUARANTEED fallback options for question:', currentQuestion.id);
    
    const fallbackOptions = {
      "platforms": ["Netflix", "Disney+", "Amazon Prime Video", "HBO Max", "Hulu", "Apple TV+", "Paramount+", "YouTube Premium"],
      "genres": ["Action", "Adventure", "Comedy", "Drama", "Horror", "Sci-Fi", "Romance", "Thriller", "Documentary", "Animation"],
      "mood": ["Relaxed", "Excited", "Thoughtful", "Adventurous", "Romantic", "Scary", "Funny", "Dramatic"],
      "decade": ["2020s", "2010s", "2000s", "1990s", "1980s", "1970s", "1960s", "Older"],
      "length": ["Short (< 90 min)", "Medium (90-120 min)", "Long (> 120 min)", "Any length"],
      "rating": ["G - Family friendly", "PG - Parental guidance", "PG-13 - Teen suitable", "R - Adult content", "Any rating"],
      "language": ["English", "Polish", "Spanish", "French", "German", "Italian", "Japanese", "Korean", "Any language"],
      "type": ["Movies", "TV Series", "Documentaries", "Both"],
      "companions": ["Alone", "With partner", "With family", "With friends", "With kids"],
      "time": ["Morning", "Afternoon", "Evening", "Late night", "Weekend"]
    };
    
    optionsToUse = fallbackOptions[currentQuestion.id as keyof typeof fallbackOptions] || ["Yes", "No", "Maybe", "I don't know"];
  }

  // FINAL EMERGENCY fallback - this should NEVER be needed now
  if (!optionsToUse || optionsToUse.length === 0) {
    console.error('EMERGENCY: Still no options! Using absolute fallback');
    optionsToUse = ["Option 1", "Option 2", "Option 3", "Option 4"];
  }

  console.log('Final options to use:', optionsToUse);

  // Skip translation for certain question types that have proper names
  const skipTranslation = ["platforms"].includes(currentQuestion.id);
  
  // Translate options if needed
  const translatedOptions = skipTranslation ? optionsToUse : optionsToUse.map(option => {
    const safeOption = option.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '');
    
    const translationKey = `quiz.options.${safeOption}`;
    const translated = t(translationKey, option);
    return translated;
  });
  
  const questionText = t(currentQuestion.question, currentQuestion.question);
  const subtitleText = currentQuestion.subtitle ? t(currentQuestion.subtitle, currentQuestion.subtitle) : "";

  console.log(`[Quiz] Final translated options:`, translatedOptions);

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
