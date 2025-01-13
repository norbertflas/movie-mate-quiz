import { Button } from "./ui/button";
import { PlayCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface WelcomeSectionProps {
  onStartQuiz: () => void;
}

export const WelcomeSection = ({ onStartQuiz }: WelcomeSectionProps) => {
  const { t } = useTranslation();

  return (
    <div className="text-center space-y-6">
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent animate-fade-in">
        {t("quiz.welcome")}
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in">
        {t("quiz.description")}
      </p>
      <Button 
        size="lg" 
        className="gap-2 animate-fade-in shadow-lg hover:shadow-xl transition-all duration-300"
        onClick={onStartQuiz}
      >
        <PlayCircle className="h-5 w-5" />
        {t("quiz.start")}
      </Button>
    </div>
  );
};