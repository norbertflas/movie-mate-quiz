import { WelcomeSection } from "@/components/WelcomeSection";
import { QuickActions } from "@/components/QuickActions";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface HomeHeaderProps {
  onStartQuiz: () => void;
}

export const HomeHeader = ({ onStartQuiz }: HomeHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      <WelcomeSection onStartQuiz={onStartQuiz} />
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={onStartQuiz}
          className="group relative px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 hover:from-blue-700 hover:via-violet-700 hover:to-purple-700"
        >
          <span className="flex items-center gap-3">
            <PlayCircle className="h-6 w-6 transition-transform group-hover:scale-110" />
            <span className="font-semibold">{t("quiz.start")}</span>
          </span>
        </Button>
      </div>
      <QuickActions />
    </div>
  );
};