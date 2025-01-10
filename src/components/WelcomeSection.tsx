import { Button } from "./ui/button";
import { PlayCircle } from "lucide-react";

interface WelcomeSectionProps {
  onStartQuiz: () => void;
}

export const WelcomeSection = ({ onStartQuiz }: WelcomeSectionProps) => {
  return (
    <div className="text-center mb-12">
      <h1 className="text-4xl font-bold tracking-tight mb-4">
        Znajdź idealny film lub serial
      </h1>
      <p className="text-lg text-muted-foreground mb-8">
        Odpowiedz na kilka pytań, a my pomożemy Ci wybrać coś dla Ciebie
      </p>
      <Button size="lg" className="gap-2" onClick={onStartQuiz}>
        <PlayCircle className="h-5 w-5" />
        Rozpocznij quiz
      </Button>
    </div>
  );
};