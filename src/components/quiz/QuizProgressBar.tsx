
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface QuizProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export const QuizProgressBar = ({ currentStep, totalSteps }: QuizProgressBarProps) => {
  const { t } = useTranslation();
  const progress = Math.floor((currentStep / totalSteps) * 100);

  return (
    <div className="w-full space-y-1">
      <div className="flex justify-between items-center text-sm text-gray-400">
        <span>{t("quiz.step", { current: currentStep, total: totalSteps })}</span>
        <span>{t("quiz.complete", { percent: progress })}</span>
      </div>
      
      <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-blue-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
};
