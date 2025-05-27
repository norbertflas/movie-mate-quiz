
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Star, Play, ExternalLink, MapPin, Clock, Users, Sparkles } from 'lucide-react';
import { useEnhancedQuizLogic } from './hooks/useEnhancedQuizLogic';
import { useEnhancedSurveySteps } from './constants/enhancedSurveySteps';
import { useEnhancedQuizSubmission } from './hooks/useEnhancedQuizSubmission';
import type { EnhancedMovieRecommendation, EnhancedQuizAnswer } from './QuizTypes';

interface EnhancedQuizProps {
  onComplete?: (recommendations: EnhancedMovieRecommendation[]) => void;
  initialRegion?: string;
  className?: string;
}

export const EnhancedQuiz: React.FC<EnhancedQuizProps> = ({
  onComplete,
  initialRegion = 'us',
  className = ''
}) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState(0);
  
  const {
    showQuiz,
    showResults,
    recommendations,
    isLoading,
    region,
    handleStartQuiz,
    changeRegion
  } = useEnhancedQuizLogic();

  const steps = useEnhancedSurveySteps();
  
  const {
    isSubmitting,
    submitQuiz,
    submitFeedback,
    analytics,
    trackEvent
  } = useEnhancedQuizSubmission({
    steps,
    region,
    onFinish: (data) => {
      onComplete?.(data);
    },
    onProgress: setProgress
  });

  // Filter steps based on answers
  const visibleSteps = steps.filter(step => 
    !step.shouldShow || step.shouldShow(answers)
  );

  const currentStepData = visibleSteps[currentStep];

  // Handle answers
  const handleAnswer = useCallback((questionId: string, answer: string) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);
    
    if (questionId === 'region') {
      const regionCode = answer.includes('Poland') ? 'pl' : 
                        answer.includes('USA') ? 'us' : 
                        answer.includes('UK') ? 'gb' : 'us';
      changeRegion?.(regionCode);
    }

    trackEvent('quiz_answer', {
      question_id: questionId,
      answer: answer,
      step: currentStep + 1
    });
  }, [answers, currentStep, changeRegion, trackEvent]);

  // Next step
  const handleNext = useCallback(() => {
    if (currentStep < visibleSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  }, [currentStep, visibleSteps.length]);

  // Previous step
  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Handle submission
  const handleSubmit = useCallback(async () => {
    const quizAnswers: EnhancedQuizAnswer[] = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer,
      confidence: 0.8,
      metadata: {
        timestamp: new Date().toISOString(),
        responseTime: 5000
      }
    }));

    try {
      await submitQuiz(quizAnswers);
    } catch (error) {
      console.error('Quiz submission failed:', error);
    }
  }, [answers, submitQuiz]);

  // Check if can proceed
  const canProceed = currentStepData && (
    currentStepData.type === 'multiple' || 
    answers[currentStepData.id]
  );

  if (!showQuiz && !showResults) {
    return <QuizWelcomeScreen onStart={handleStartQuiz} region={region} />;
  }

  if (showResults) {
    return (
      <QuizResults 
        recommendations={recommendations}
        region={region}
        onFeedback={submitFeedback}
        analytics={analytics}
        onRestart={handleStartQuiz}
      />
    );
  }

  return (
    <div className={`max-w-4xl mx-auto p-6 ${className}`}>
      {/* Progress header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{t('quiz.title')}</h2>
          <Badge variant="outline">
            {currentStep + 1} / {visibleSteps.length}
          </Badge>
        </div>
        
        <Progress 
          value={(currentStep / visibleSteps.length) * 100} 
          className="h-2"
        />
        
        {isSubmitting && (
          <div className="mt-2">
            <Progress value={progress} className="h-1" />
            <p className="text-sm text-muted-foreground mt-1">
              Processing...
            </p>
          </div>
        )}
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        {currentStepData && (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <QuizQuestion
              step={currentStepData}
              answer={answers[currentStepData.id]}
              onAnswer={(answer) => handleAnswer(currentStepData.id, answer)}
              answers={answers}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0 || isSubmitting}
        >
          Previous
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canProceed || isSubmitting}
          className="min-w-[120px]"
        >
          {isSubmitting ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
            </motion.div>
          ) : null}
          {currentStep === visibleSteps.length - 1 
            ? 'Get Recommendations' 
            : 'Next'
          }
        </Button>
      </div>
    </div>
  );
};

// Quiz Question Component
interface QuizQuestionProps {
  step: any;
  answer: string;
  onAnswer: (answer: string) => void;
  answers: Record<string, string>;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  step,
  answer,
  onAnswer,
  answers
}) => {
  const { t } = useTranslation();
  
  const options = step.getDynamicOptions 
    ? step.getDynamicOptions(answers)
    : step.options;

  const translatedOptions = options.map(option => 
    option.startsWith('quiz.') ? t(option) : option
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">
          {step.question}
        </CardTitle>
        {step.subtitle && (
          <p className="text-muted-foreground">
            {step.subtitle}
          </p>
        )}
      </CardHeader>
      
      <CardContent>
        {step.type === 'single' ? (
          <div className="space-y-3">
            {translatedOptions.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Button
                  variant={answer === option ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => onAnswer(option)}
                >
                  {option}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              Select multiple options:
            </p>
            {translatedOptions.map((option, index) => {
              const selectedOptions = answer ? answer.split(',') : [];
              const isSelected = selectedOptions.includes(option);
              
              return (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`option-${index}`}
                    checked={isSelected}
                    onCheckedChange={(checked) => {
                      let newSelected = [...selectedOptions];
                      if (checked) {
                        newSelected.push(option);
                      } else {
                        newSelected = newSelected.filter(o => o !== option);
                      }
                      onAnswer(newSelected.join(','));
                    }}
                  />
                  <Label 
                    htmlFor={`option-${index}`}
                    className="cursor-pointer flex-1 p-2 rounded hover:bg-muted/50"
                  >
                    {option}
                  </Label>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Welcome Screen Component
interface QuizWelcomeScreenProps {
  onStart: () => void;
  region: string;
}

const QuizWelcomeScreen: React.FC<QuizWelcomeScreenProps> = ({
  onStart,
  region
}) => {
  const { t } = useTranslation();

  return (
    <div className="max-w-2xl mx-auto text-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-8">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">
            Enhanced Movie Quiz
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Get personalized movie recommendations with streaming availability
          </p>
        </div>

        <Card className="text-left mb-8">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-500" />
              Features
            </h3>
            <ul className="space-y-2 text-sm">
              <li>✨ Personalized recommendations</li>
              <li>🎬 Streaming availability</li>
              <li>🌍 Region-specific content</li>
              <li>⏱️ Quick 5-minute quiz</li>
            </ul>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-2 mb-6">
          <MapPin className="w-4 h-4" />
          <span className="text-sm text-muted-foreground">
            Region: {region.toUpperCase()}
          </span>
        </div>

        <Button 
          onClick={onStart}
          size="lg"
          className="w-full max-w-sm"
        >
          <Play className="w-4 h-4 mr-2" />
          Start Quiz
        </Button>
      </motion.div>
    </div>
  );
};

// Quiz Results Component
interface QuizResultsProps {
  recommendations: EnhancedMovieRecommendation[];
  region: string;
  onFeedback: (rating: number, comment?: string) => void;
  analytics?: any;
  onRestart: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({
  recommendations,
  region,
  onFeedback,
  analytics,
  onRestart
}) => {
  const { t } = useTranslation();
  const [feedbackRating, setFeedbackRating] = useState<number>(0);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
        <h2 className="text-3xl font-bold mb-2">
          Your Recommendations
        </h2>
        <p className="text-muted-foreground">
          Found {recommendations.length} great movies for you
        </p>
        
        {analytics && (
          <div className="flex justify-center gap-4 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {Math.round(analytics.performance?.totalTime / 1000)}s
            </span>
            <span className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {region.toUpperCase()}
            </span>
            <span className="flex items-center">
              <Star className="w-4 h-4 mr-1" />
              {analytics.recommendations?.withStreaming || 0} with streaming
            </span>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {recommendations.map((movie, index) => (
          <MovieRecommendationCard
            key={movie.id}
            movie={movie}
            index={index}
            region={region}
          />
        ))}
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>How did we do?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm">Rate our recommendations:</span>
            {[1, 2, 3, 4, 5].map((rating) => (
              <Button
                key={rating}
                variant={feedbackRating >= rating ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setFeedbackRating(rating);
                  onFeedback(rating);
                }}
              >
                <Star className="w-4 h-4" />
              </Button>
            ))}
          </div>
          
          <div className="flex gap-4">
            <Button onClick={onRestart} variant="outline">
              Try Again
            </Button>
            <Button variant="outline">
              Save Recommendations
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Movie Recommendation Card Component
interface MovieRecommendationCardProps {
  movie: EnhancedMovieRecommendation;
  index: number;
  region: string;
}

const MovieRecommendationCard: React.FC<MovieRecommendationCardProps> = ({
  movie,
  index,
  region
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="h-full hover:shadow-lg transition-shadow">
        <div className="relative">
          <img
            src={movie.poster_path 
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : '/placeholder-movie.jpg'
            }
            alt={movie.title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          
          <div className="absolute top-2 right-2 bg-black/80 rounded-full px-2 py-1 text-white text-xs flex items-center">
            <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
            {movie.vote_average.toFixed(1)}
          </div>

          {movie.recommendationScore && (
            <div className="absolute top-2 left-2">
              <Badge variant={movie.recommendationScore > 80 ? "default" : "secondary"}>
                {Math.round(movie.recommendationScore)}% match
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
            {movie.title}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
            {movie.overview}
          </p>

          {movie.genres && (
            <div className="flex flex-wrap gap-1 mb-3">
              {movie.genres.slice(0, 3).map((genre) => (
                <Badge key={genre} variant="outline" className="text-xs">
                  {genre}
                </Badge>
              ))}
            </div>
          )}

          {movie.matchReasons && movie.matchReasons.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-1">
                Why recommended:
              </p>
              <ul className="text-xs space-y-1">
                {movie.matchReasons.slice(0, 2).map((reason, idx) => (
                  <li key={idx} className="flex items-center">
                    <span className="w-1 h-1 bg-primary rounded-full mr-2" />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Separator className="my-3" />

          {movie.streamingAvailability && movie.streamingAvailability.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium">Available on:</p>
              <div className="space-y-2">
                {movie.streamingAvailability.slice(0, 3).map((service, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="font-medium">{service.service}</span>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={service.type === 'subscription' ? 'default' : 'outline'}
                        className="text-xs"
                      >
                        {service.type}
                      </Badge>
                      {service.link && service.link !== '#' && (
                        <Button size="sm" variant="ghost" asChild>
                          <a href={service.link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground text-xs">
              {movie.alternativeRegions ? (
                <p>Available in other regions</p>
              ) : (
                <p>No streaming info available</p>
              )}
            </div>
          )}

          <div className="flex gap-2 mt-3">
            {movie.trailer_url && (
              <Button size="sm" variant="outline" asChild>
                <a href={movie.trailer_url} target="_blank" rel="noopener noreferrer">
                  <Play className="w-3 h-3 mr-1" />
                  Trailer
                </a>
              </Button>
            )}
            <Button size="sm" variant="outline">
              Add to Watchlist
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EnhancedQuiz;
