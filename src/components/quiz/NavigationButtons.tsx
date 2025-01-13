import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { NavigationButtonsProps } from "./QuizTypes";

export const NavigationButtons = ({
  currentStep,
  canGoNext,
  onPrevious,
  onNext,
  totalSteps
}: NavigationButtonsProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-between pt-4">
      {currentStep > 1 && (
        <Button
          variant="outline"
          onClick={onPrevious}
          className="gap-2 bg-black/20 border-gray-800 hover:bg-gray-800/50"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("quiz.previous")}
        </Button>
      )}
      
      {canGoNext && currentStep < totalSteps && (
        <Button
          onClick={onNext}
          className="gap-2 ml-auto bg-blue-600 hover:bg-blue-700"
        >
          {t("quiz.next")}
          <ArrowRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};