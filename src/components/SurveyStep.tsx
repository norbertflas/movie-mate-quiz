import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";

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
      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Krok {currentStep} z {totalSteps}
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">{question}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {options.map((option) => (
            type === "multiple" ? (
              <div
                key={option}
                className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer"
                onClick={() => onSelect(option)}
              >
                <Checkbox
                  checked={selectedOptions.includes(option)}
                  onCheckedChange={() => onSelect(option)}
                />
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {option}
                </label>
              </div>
            ) : (
              <Button
                key={option}
                variant="outline"
                className="h-auto py-4 px-6 text-left justify-start card-hover"
                onClick={() => onSelect(option)}
              >
                {option}
              </Button>
            )
          ))}
        </div>
        {type === "multiple" && selectedOptions.length > 0 && (
          <div className="flex justify-end">
            <Button
              onClick={handleNextStep}
              className="w-full md:w-auto"
            >
              Dalej
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  );
};