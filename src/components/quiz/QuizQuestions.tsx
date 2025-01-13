import { SurveyStep } from "@/components/SurveyStep";
import type { QuizQuestionsProps } from "./QuizTypes";

export const QuizQuestions = ({ questions, currentStep, onAnswer }: QuizQuestionsProps) => {
  return (
    <div className="space-y-8">
      <SurveyStep
        question={questions[currentStep].question}
        options={questions[currentStep].options}
        onSelect={onAnswer}
        currentStep={currentStep + 1}
        totalSteps={questions.length}
        type="single"
        selectedOptions={[]}
      />
    </div>
  );
};