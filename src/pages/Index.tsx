import { useState } from "react";
import { QuizSection } from "@/components/QuizSection";
import { SearchBar } from "@/components/SearchBar";
import { QuickActions } from "@/components/QuickActions";
import { WelcomeSection } from "@/components/WelcomeSection";

const Index = () => {
  const [showQuiz, setShowQuiz] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <SearchBar />
      {!showQuiz ? (
        <>
          <WelcomeSection />
          <QuickActions />
        </>
      ) : (
        <QuizSection />
      )}
    </div>
  );
};

export default Index;