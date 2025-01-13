import { useState } from "react";
import { QuizQuestions } from "./QuizQuestions";
import { QuizResults } from "./QuizResults";
import { QuizProgressBar } from "./QuizProgressBar";
import { useQuizLogic } from "./QuizLogic";
import { QuizAnswer } from "./QuizTypes";
import { useSurveySteps } from "./constants/surveySteps";

export const GroupQuizView = () => {
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const { processAnswers } = useQuizLogic();
  const questions = useSurveySteps();

  const handleQuizComplete = (quizAnswers: QuizAnswer[]) => {
    setAnswers(quizAnswers);
    setShowResults(true);
  };

  if (showResults) {
    const recommendations = processAnswers(answers);
    return <QuizResults recommendations={recommendations} />;
  }

  return (
    <div className="space-y-8">
      <QuizProgressBar 
        currentStep={answers.length} 
        totalSteps={questions.length} 
      />
      <QuizQuestions
        questions={questions}
        onComplete={handleQuizComplete}
      />
    </div>
  );
};