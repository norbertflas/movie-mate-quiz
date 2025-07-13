
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { NavigationButtonsProps } from "./QuizTypes";

export const NavigationButtons = ({
  currentStep,
  canGoNext,
  onPrevious,
  onNext,
  totalSteps
}: NavigationButtonsProps) => {

  return (
    <div className="flex justify-between pt-6">
      {currentStep > 1 && (
        <Button
          variant="outline"
          onClick={onPrevious}
          className="gap-2 bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>
      )}
      
      {canGoNext && (
        <Button
          onClick={onNext}
          className="gap-2 ml-auto bg-blue-600 hover:bg-blue-700 text-white"
        >
          Next
          <ArrowRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};
