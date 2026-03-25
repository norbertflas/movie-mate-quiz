
import { ComprehensiveQuiz } from "@/components/quiz/ComprehensiveQuiz";
import { Navigation } from "@/components/Navigation";

export const ComprehensiveQuizPage = () => {
  return (
    <div className="min-h-screen cosmic-bg">
      <Navigation />
      <div className="pt-24 pb-8">
        <ComprehensiveQuiz />
      </div>
    </div>
  );
};
