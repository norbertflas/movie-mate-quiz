import { SurveyStep } from "@/components/SurveyStep";
import type { QuizQuestionsProps } from "./QuizTypes";
import { useTranslation } from "react-i18next";

export const QuizQuestions = ({ questions, currentStep, onAnswer, answers }: QuizQuestionsProps) => {
  const { t } = useTranslation();
  const currentQuestion = questions[currentStep];

  if (!currentQuestion) {
    return null;
  }

  // Translate options before passing them to SurveyStep
  const translatedOptions = currentQuestion.options.map(option => t(option));

  return (
    <div className="space-y-8">
      <SurveyStep
        question={t(currentQuestion.question)}
        options={translatedOptions}
        onSelect={onAnswer}
        currentStep={currentStep + 1}
        totalSteps={questions.length}
        type={currentQuestion.type}
        selectedOptions={answers[currentStep] ? [answers[currentStep].answer] : []}
      />
    </div>
  );
};