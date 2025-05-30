
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { QuizQuestions } from "./QuizQuestions";
import { useEffect, useState } from "react";
import type { SurveyStep } from "./constants/surveySteps";
import type { QuizAnswer } from "./QuizTypes";

interface QuizFormProps {
  steps: SurveyStep[];
  currentStep: number;
  answers: QuizAnswer[];
  isSubmitting: boolean;
  onAnswer: (answer: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  onFinish: () => void;
}

export const QuizForm = ({
  steps,
  currentStep,
  answers,
  isSubmitting,
  onAnswer,
  onNext,
  onPrevious,
  onFinish
}: QuizFormProps) => {
  const { t } = useTranslation();
  const [answerMap, setAnswerMap] = useState<Record<string, string>>({});

  // Update answerMap whenever answers change
  useEffect(() => {
    const newAnswerMap = answers.reduce((map, answer) => {
      map[answer.questionId] = answer.answer;
      return map;
    }, {} as Record<string, string>);
    
    setAnswerMap(newAnswerMap);
  }, [answers]);

  // Check if current step has an answer
  const hasCurrentAnswer = answers[currentStep]?.answer !== undefined;

  return (
    <div className="space-y-6">
      <QuizQuestions
        questions={steps}
        currentStep={currentStep}
        onAnswer={onAnswer}
        answers={answers}
        answerMap={answerMap}
      />
      
      <div className="flex justify-between mt-4">
        {currentStep > 0 && (
          <Button 
            onClick={onPrevious}
            variant="outline"
            className="bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 text-white"
          >
            {t("quiz.previous")}
          </Button>
        )}
        
        {currentStep < steps.length - 1 ? (
          <Button 
            onClick={onNext}
            disabled={!hasCurrentAnswer}
            className="ml-auto bg-blue-600 hover:bg-blue-700 text-white"
          >
            {t("quiz.next")}
          </Button>
        ) : (
          <Button 
            onClick={onFinish}
            disabled={!hasCurrentAnswer || isSubmitting}
            className="ml-auto bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("quiz.processing")}
              </>
            ) : (
              t("quiz.finish")
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
