import { WelcomeSection } from "@/components/WelcomeSection";
import { QuickActions } from "@/components/QuickActions";

interface HomeHeaderProps {
  onStartQuiz: () => void;
}

export const HomeHeader = ({ onStartQuiz }: HomeHeaderProps) => {
  return (
    <>
      <WelcomeSection onStartQuiz={onStartQuiz} />
      <QuickActions />
    </>
  );
};