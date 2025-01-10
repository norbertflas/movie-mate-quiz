import { useState } from "react";
import { QuizSection } from "@/components/QuizSection";
import { SearchBar } from "@/components/SearchBar";
import { QuickActions } from "@/components/QuickActions";
import { WelcomeSection } from "@/components/WelcomeSection";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [showQuiz, setShowQuiz] = useState(false);
  const { toast } = useToast();

  const handleStartQuiz = () => {
    setShowQuiz(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <SearchBar />
      {!showQuiz ? (
        <>
          <WelcomeSection onStartQuiz={handleStartQuiz} />
          <QuickActions />
        </>
      ) : (
        <QuizSection />
      )}
    </div>
  );
};

export default Index;