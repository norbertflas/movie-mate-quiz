
import { motion } from "framer-motion";
import { QuestionOption } from "./QuestionOption";
import { useTranslation } from "react-i18next";
import type { SurveyStep } from "./constants/surveySteps";
import type { QuizAnswer } from "./QuizTypes";

interface QuizQuestionsProps {
  questions: SurveyStep[];
  currentStep: number;
  onAnswer: (answer: string) => void;
  answers: QuizAnswer[];
  answerMap: Record<string, string>;
}

export const QuizQuestions = ({
  questions,
  currentStep,
  onAnswer,
  answers,
  answerMap
}: QuizQuestionsProps) => {
  const { t } = useTranslation();
  
  const currentQuestion = questions[currentStep];
  
  if (!currentQuestion) return null;

  // Check if this question should be shown based on previous answers
  if (currentQuestion.shouldShow && !currentQuestion.shouldShow(answerMap)) {
    return null;
  }

  const currentAnswer = answers.find(a => a.questionId === currentQuestion.id);

  return (
    <motion.div
      key={currentQuestion.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">
          {t(currentQuestion.title)}
        </h2>
        {currentQuestion.subtitle && (
          <p className="text-gray-300 text-lg">
            {t(currentQuestion.subtitle)}
          </p>
        )}
      </div>

      <div className="grid gap-3 sm:gap-4">
        {currentQuestion.options.map((option) => (
          <QuestionOption
            key={option.value}
            option={option}
            isSelected={currentAnswer?.answer === option.value}
            onSelect={() => onAnswer(option.value)}
            multiSelect={currentQuestion.multiSelect}
          />
        ))}
      </div>

      {currentQuestion.id === 'challenges' && (
        <div className="text-center text-sm text-gray-400">
          {t('quiz.questions.challengesNote') || 'Your answer will affect the next questions'}
        </div>
      )}
    </motion.div>
  );
};
