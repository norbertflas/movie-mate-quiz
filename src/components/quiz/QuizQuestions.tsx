
import { SurveyStep } from "@/components/SurveyStep";
import type { QuizQuestionsProps } from "./QuizTypes";
import { useTranslation } from "react-i18next";

export const QuizQuestions = ({ questions, currentStep, onAnswer, answers }: QuizQuestionsProps) => {
  const { t } = useTranslation();
  const currentQuestion = questions[currentStep];

  if (!currentQuestion) {
    console.error('No question found for step:', currentStep);
    return null;
  }

  // Get the current answer if it exists
  const currentAnswer = answers.find(a => a.questionId === currentQuestion.id)?.answer;
  console.log('Current answer for question', currentQuestion.id, ':', currentAnswer);

  // Translate options before passing them to SurveyStep
  const translatedOptions = currentQuestion.options.map(option => {
    // For platform names which shouldn't be translated
    if (currentQuestion.id === "vod") {
      return option;
    }
    return t(option);
  });

  return (
    <div className="space-y-8">
      <SurveyStep
        question={t(currentQuestion.question)}
        options={translatedOptions}
        onSelect={onAnswer}
        currentStep={currentStep + 1}
        totalSteps={questions.length}
        type={currentQuestion.type}
        selectedOptions={currentAnswer ? [currentAnswer] : []}
      />
    </div>
  );
};
