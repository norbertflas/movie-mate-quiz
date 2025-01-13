import { useState } from "react";
import { QuizAnswer } from "../QuizTypes";
import { useQuizLogic } from "../QuizLogic";

export const useQuizState = () => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const { processAnswers } = useQuizLogic();

  const handleStartQuiz = () => {
    setShowQuiz(true);
  };

  const handleQuizComplete = async (quizAnswers: QuizAnswer[]) => {
    setAnswers(quizAnswers);
    await processAnswers(quizAnswers);
    setShowResults(true);
  };

  return {
    showQuiz,
    showResults,
    answers,
    handleStartQuiz,
    handleQuizComplete
  };
};