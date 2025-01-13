import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SurveyStepProps {
  question: string;
  options: string[];
  onSelect: (option: string) => void;
  currentStep: number;
  totalSteps: number;
  type: "single" | "multiple";
  selectedOptions: string[];
}

export const SurveyStep = ({
  question,
  options,
  onSelect,
  currentStep,
  totalSteps,
  type,
  selectedOptions,
}: SurveyStepProps) => {
  const { t } = useTranslation();
  
  const handleNextStep = () => {
    if (type === "multiple" && selectedOptions.length > 0) {
      onSelect("NEXT_STEP");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full"
    >
      <Card className="p-6 space-y-6 bg-black/40 backdrop-blur-lg border-gray-800">
        <div className="space-y-2">
          <p className="text-sm text-gray-400">
            {t("quiz.step", { current: currentStep, total: totalSteps })}
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-white">{question}</h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {options.map((option) => (
            type === "multiple" ? (
              <div
                key={option}
                className="flex items-center space-x-3 p-4 rounded-lg border border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-colors"
                onClick={() => onSelect(option)}
              >
                <Checkbox
                  checked={selectedOptions.includes(option)}
                  onCheckedChange={() => onSelect(option)}
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <label className="text-base text-gray-200 cursor-pointer select-none">
                  {option}
                </label>
              </div>
            ) : (
              <Button
                key={option}
                variant="outline"
                className={`h-auto py-4 px-6 text-left justify-start transition-all duration-200 hover:bg-gray-800/50 hover:border-gray-700 ${
                  selectedOptions.includes(option) ? 'bg-gray-800 border-gray-700' : 'bg-black/20 border-gray-800'
                }`}
                onClick={() => onSelect(option)}
              >
                {option}
              </Button>
            )
          ))}
        </div>

        <div className="flex justify-between pt-4">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={() => onSelect("PREV_STEP")}
              className="gap-2 bg-black/20 border-gray-800 hover:bg-gray-800/50"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("quiz.previous")}
            </Button>
          )}
          
          {type === "multiple" && selectedOptions.length > 0 && (
            <Button
              onClick={handleNextStep}
              className="gap-2 ml-auto bg-blue-600 hover:bg-blue-700"
            >
              {t("quiz.next")}
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
};