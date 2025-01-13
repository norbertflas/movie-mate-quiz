import { WelcomeSection } from "../WelcomeSection";
import { QuizQuestions } from "./QuizQuestions";
import { QuizResults } from "./QuizResults";
import { QuizProgressBar } from "./QuizProgressBar";
import { useSurveySteps } from "./constants/surveySteps";
import { useQuizState } from "./hooks/useQuizState";

export const QuizSection = () => {
  const { 
    showQuiz, 
    showResults, 
    answers, 
    handleStartQuiz, 
    handleQuizComplete 
  } = useQuizState();
  
  const questions = useSurveySteps();

  if (!showQuiz) {
    return <WelcomeSection onStartQuiz={handleStartQuiz} />;
  }

  if (showResults) {
    return <QuizResults />;
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