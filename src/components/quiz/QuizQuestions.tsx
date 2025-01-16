import { SurveyStep } from "@/components/SurveyStep";
import type { QuizQuestionsProps } from "./QuizTypes";
import { useTranslation } from "react-i18next";

export const QuizQuestions = ({ questions, currentStep, onAnswer }: QuizQuestionsProps) => {
  const { t } = useTranslation();
  const currentQuestion = questions[currentStep];

  if (!currentQuestion) {
    return null;
  }

  const options = currentQuestion.getDynamicOptions
    ? currentQuestion.getDynamicOptions({})
    : currentQuestion.options;

  return (
    <div className="space-y-8">
      <SurveyStep
        question={currentQuestion.question}
        options={options}
        onSelect={onAnswer}
        currentStep={currentStep + 1}
        totalSteps={questions.length}
        type={currentQuestion.type}
        selectedOptions={[]}
      />
    </div>
  );
};