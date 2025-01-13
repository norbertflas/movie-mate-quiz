import { WelcomeSection } from "@/components/WelcomeSection";
import { QuickActions } from "@/components/QuickActions";

interface HomeHeaderProps {
  onStartQuiz: () => void;
}

export const HomeHeader = ({ onStartQuiz }: HomeHeaderProps) => {
  return (
    <div className="space-y-8">
      <WelcomeSection onStartQuiz={onStartQuiz} />
      <QuickActions />
    </div>
  );
};