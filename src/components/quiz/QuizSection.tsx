import { useState } from "react";
import { WelcomeSection } from "../WelcomeSection";
import { QuizQuestions } from "./QuizQuestions";
import { QuizResults } from "./QuizResults";
import { QuizProgressBar } from "./QuizProgressBar";
import { useQuizLogic } from "./QuizLogic";
import { QuizAnswer } from "./QuizTypes";
import { useSurveySteps } from "./constants/surveySteps";

export const QuizSection = () => {
  const { 
    showQuiz, 
    showResults, 
    answers, 
    recommendations,
    handleStartQuiz, 
    handleQuizComplete 
  } = useQuizLogic();
  
  const questions = useSurveySteps();

  if (!showQuiz) {
    return <WelcomeSection onStartQuiz={handleStartQuiz} />;
  }

  if (showResults) {
    return <QuizResults recommendations={recommendations} isGroupQuiz={false} />;
  }

  return (
    <div className="space-y-8">
      <QuizProgressBar 
        currentStep={answers.length} 
        totalSteps={questions.length} 
      />
      <QuizQuestions
        questions={questions}
        currentStep={answers.length}
        onAnswer={(answer) => {
          const newAnswer: QuizAnswer = {
            questionId: questions[answers.length].id,
            answer
          };
          handleQuizComplete([...answers, newAnswer]);
        }}
        answers={answers}
      />
    </div>
  );
};