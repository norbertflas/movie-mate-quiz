
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { QuestionOption } from "./quiz/QuestionOption";
import { Film, Tv, Check } from "lucide-react";

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
      // For multiple selection, parse the current selections (if any) or use empty array
      const currentSelections = selectedOptions.length > 0 
        ? (typeof selectedOptions[0] === 'string' && selectedOptions[0].startsWith('[') 
          ? JSON.parse(selectedOptions[0]) 
          : selectedOptions)
        : [];

      // Toggle the selection
      const isSelected = currentSelections.includes(option);
      const newSelection = isSelected
        ? currentSelections.filter((item: string) => item !== option)
        : [...currentSelections, option];

      // Send the new selection as a JSON string
      onSelect(JSON.stringify(newSelection));
    }
  };

  // Parse selected options for multiple selection type
  const parsedSelectedOptions = type === "multiple" && selectedOptions.length > 0
    ? (typeof selectedOptions[0] === 'string' && selectedOptions[0].startsWith('[')
      ? JSON.parse(selectedOptions[0])
      : selectedOptions)
    : selectedOptions;

  // Special rendering for content type (Movies/TV Series)
  const isContentTypeQuestion = options.includes(t("quiz.options.movie")) && 
                               options.includes(t("quiz.options.series"));
                               
  if (isContentTypeQuestion) {
    return (
      <div className="w-full">
        <div className="space-y-4">
          {options.map((option) => {
            const isMovie = option === t("quiz.options.movie");
            const isTVSeries = option === t("quiz.options.series");
            const isSelected = selectedOptions.includes(option);
            
            if (isMovie || isTVSeries) {
              return (
                <motion.div
                  key={option}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    bg-gray-900 p-4 rounded-xl cursor-pointer transition-all duration-200
                    ${isSelected ? 'ring-2 ring-blue-500 bg-blue-900/30' : 'hover:bg-gray-800'}
                  `}
                  onClick={() => onSelect(option)}
                >
                  <div className="flex items-center">
                    <div className={`
                      flex items-center justify-center w-14 h-14 rounded-full mr-4
                      ${isSelected ? 'bg-blue-600' : 'bg-gray-800'}
                    `}>
                      {isMovie ? (
                        <Film className="h-6 w-6" />
                      ) : (
                        <Tv className="h-6 w-6" />
                      )}
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-xl font-medium">{option}</h3>
                    </div>
                    {isSelected && (
                      <div className="ml-4">
                        <Check className="h-6 w-6 text-blue-400" />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            }
            
            return (
              <QuestionOption
                key={option}
                option={option}
                isSelected={selectedOptions.includes(option)}
                onSelect={() => onSelect(option)}
                type={type}
              />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {question && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            {question}
          </h2>
        </div>
      )}

      <div className="space-y-3">
        {options.map((option) => (
          <QuestionOption
            key={option}
            option={option}
            isSelected={type === "multiple" 
              ? parsedSelectedOptions.includes(option)
              : selectedOptions.includes(option)
            }
            onSelect={() => handleOptionSelect(option)}
            type={type}
          />
        ))}
      </div>
    </div>
  );
};
