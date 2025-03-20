
import { Progress } from "@/components/ui/progress";

interface QuizProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export const QuizProgressBar = ({ currentStep, totalSteps }: QuizProgressBarProps) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="space-y-2">
      <Progress value={progress} className="h-2" />
      <p className="text-sm text-muted-foreground text-center">
        {currentStep} / {totalSteps}
      </p>
    </div>
  );
};
