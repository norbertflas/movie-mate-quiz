import { motion } from "framer-motion";
import { Card } from "./ui/card";
import { useTranslation } from "react-i18next";
import { QuestionOption } from "./quiz/QuestionOption";
import { NavigationButtons } from "./quiz/NavigationButtons";

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

  const handleOptionSelect = (option: string) => {
    if (type === "single") {
      onSelect(option);
    } else {
      const isSelected = selectedOptions.includes(option);
      const newSelection = isSelected
        ? selectedOptions.filter(item => item !== option)
        : [...selectedOptions, option];
      onSelect(JSON.stringify(newSelection));
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
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            {question}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {options.map((option) => (
            <QuestionOption
              key={option}
              option={option}
              isSelected={type === "multiple" 
                ? JSON.parse(selectedOptions[0] || "[]").includes(option)
                : selectedOptions.includes(option)
              }
              onSelect={() => handleOptionSelect(option)}
              type={type}
            />
          ))}
        </div>
      </Card>
    </motion.div>
  );
};