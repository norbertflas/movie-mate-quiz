import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface EnhancedQuizProps {
  onBack?: () => void;
  onComplete?: (results: any) => void;
  userPreferences?: any;
}

const EnhancedQuiz = ({ onBack, onComplete, userPreferences }: EnhancedQuizProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);

  const handleComplete = () => {
    const results = {
      answers,
      preferences: userPreferences,
      timestamp: new Date().toISOString()
    };
    onComplete?.(results);
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      onBack?.();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Movie Preference Quiz</h2>
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of 5
            </span>
          </div>
          
          <div className="space-y-4">
            <p>What type of movies do you enjoy most?</p>
            {/* Quiz content would go here */}
          </div>
          
          <div className="flex justify-between">
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button onClick={handleNext}>
              {currentStep < 4 ? 'Next' : 'Complete'}
              {currentStep < 4 && <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default EnhancedQuiz;
