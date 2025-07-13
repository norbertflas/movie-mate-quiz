
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface QuestionOptionProps {
  option: string;
  isSelected: boolean;
  onSelect: () => void;
  type: "single" | "multiple";
}

export const QuestionOption = ({
  option,
  isSelected,
  onSelect,
  type,
}: QuestionOptionProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative w-full p-4 rounded-xl border transition-colors duration-200 cursor-pointer
        ${isSelected 
          ? 'bg-gray-900/90 border-blue-500' 
          : 'bg-gray-900/50 border-gray-800 hover:bg-gray-900/70'}
      `}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <span className="text-lg font-medium">{option}</span>
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-blue-600 rounded-full"
          >
            <Check className="h-4 w-4 text-white" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
