import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SurveyStep } from "@/components/SurveyStep";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { QuizAnswer } from "./QuizTypes";

interface QuizQuestionsProps {
  questions: Array<{
    id: string;
    question: string;
    options: string[];
  }>;
  onComplete: (answers: QuizAnswer[]) => void;
}

export const QuizQuestions = ({ questions, onComplete }: QuizQuestionsProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const { t } = useTranslation();

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = {
      questionId: questions[currentStep].id,
      answer,
    };
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(newAnswers);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="space-y-8">
      <SurveyStep
        question={questions[currentStep].question}
        options={questions[currentStep].options}
        onSelect={handleAnswer}
        selectedOption={answers[currentStep]?.answer}
      />
      
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("quiz.previous")}
        </Button>
        
        {currentStep < questions.length - 1 && (
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!answers[currentStep]}
            className="gap-2"
          >
            {t("quiz.next")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};