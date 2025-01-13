import { Button } from "./ui/button";
import { PlayCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface WelcomeSectionProps {
  onStartQuiz: () => void;
}

export const WelcomeSection = ({ onStartQuiz }: WelcomeSectionProps) => {
  const { t } = useTranslation();

  return (
    <div className="text-center mb-12">
      <h1 className="text-4xl font-bold tracking-tight mb-4">
        {t("quiz.welcome")}
      </h1>
      <p className="text-lg text-muted-foreground mb-8">
        {t("quiz.description")}
      </p>
      <Button size="lg" className="gap-2" onClick={onStartQuiz}>
        <PlayCircle className="h-5 w-5" />
        {t("quiz.start")}
      </Button>
    </div>
  );
};