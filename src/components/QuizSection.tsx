import { useState } from "react";
import { WelcomeSection } from "./WelcomeSection";
import { QuizQuestions } from "./quiz/QuizQuestions";
import { QuizResults } from "./quiz/QuizResults";
import { QuizProgressBar } from "./quiz/QuizProgressBar";
import { useQuizLogic } from "./quiz/QuizLogic";
import { QuizAnswer } from "./quiz/QuizTypes";
import { QUIZ_QUESTIONS } from "./quiz/QuizConstants";

export const QuizSection = () => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { processAnswers } = useQuizLogic();
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);

  const handleStartQuiz = () => {
    setShowQuiz(true);
  };

  const handleQuizComplete = (quizAnswers: QuizAnswer[]) => {
    setAnswers(quizAnswers);
    setShowResults(true);
  };

  if (!showQuiz) {
    return <WelcomeSection onStartQuiz={handleStartQuiz} />;
  }

  if (showResults) {
    return <QuizResults answers={answers} onProcessAnswers={processAnswers} />;
  }

  return (
    <div className="space-y-8">
      <QuizProgressBar 
        currentStep={answers.length} 
        totalSteps={QUIZ_QUESTIONS.length} 
      />
      <QuizQuestions
        questions={QUIZ_QUESTIONS}
        onComplete={handleQuizComplete}
      />
    </div>
  );
};