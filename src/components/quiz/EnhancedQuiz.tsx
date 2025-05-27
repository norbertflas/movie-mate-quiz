
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Star, Play, ExternalLink, MapPin, Clock, Users, Sparkles } from 'lucide-react';
import { useEnhancedQuizLogic } from './hooks/useEnhancedQuizLogic';
import { useEnhancedSurveySteps } from './constants/enhancedSurveySteps';
import type { EnhancedMovieRecommendation, SurveyStepType, QuizAnswer } from './QuizTypes';

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
    changeRegion,
    handleQuizComplete
  } = useEnhancedQuizLogic();

  const steps = useEnhancedSurveySteps(region);
  
  const visibleSteps = steps.filter(step => 
    !step.shouldShow || step.shouldShow(answers)
  );

  const currentStepData = visibleSteps[currentStep];

  const handleAnswer = useCallback((questionId: string, answer: string) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);
    
    if (questionId === 'region') {
      const regionCode = answer.includes('Poland') ? 'pl' : 
                        answer.includes('USA') ? 'us' : 
                        answer.includes('UK') ? 'gb' : 'us';
      changeRegion?.(regionCode);
    }
  }, [answers, changeRegion]);

  const handleNext = useCallback(() => {
    if (currentStep < visibleSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  }, [currentStep, visibleSteps.length]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleSubmit = useCallback(async () => {
    const quizAnswers: QuizAnswer[] = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer,
      confidence: 0.8,
      metadata: {
        timestamp: new Date().toISOString(),
        responseTime: 5000
      }
    }));

    try {
      const results = await handleQuizComplete(quizAnswers);
      onComplete?.(results);
    } catch (error) {
      console.error('Quiz submission failed:', error);
    }
  }, [answers, handleQuizComplete, onComplete]);

  const canProceed = currentStepData && (
    currentStepData.type === 'multiple' || 
    answers[currentStepData.id]
  );

  if (!showQuiz && !showResults) {
    return <QuizWelcomeScreen onStart={handleStartQuiz} region={region || 'us'} />;
  }

  if (showResults) {
    return (
      <QuizResults 
        recommendations={recommendations}
        region={region || 'us'}
        onRestart={handleStartQuiz}
      />
    );
  }

  return (
    <div className={`max-w-4xl mx-auto p-6 ${className}`}>
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
        
        {isLoading && (
          <div className="mt-2">
            <Progress value={progress} className="h-1" />
            <p className="text-sm text-muted-foreground mt-1">
              {t('quiz.processing')}...
            </p>
          </div>
        )}
      </div>

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

      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0 || isLoading}
        >
          {t('quiz.previous')}
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canProceed || isLoading}
          className="min-w-[120px]"
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
            </motion.div>
          ) : null}
          {currentStep === visibleSteps.length - 1 
            ? t('quiz.getRecommendations') 
            : t('quiz.next')
          }
        </Button>
      </div>
    </div>
  );
};

// Quiz Question Component
interface QuizQuestionProps {
  step: SurveyStepType;
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
          {t(step.question)}
        </CardTitle>
        {step.subtitle && (
          <p className="text-muted-foreground">
            {t(step.subtitle)}
          </p>
        )}
      </CardHeader>
      
      <CardContent>
        {step.type === 'single' ? (
          <RadioGroup
            value={answer || ''}
            onValueChange={onAnswer}
            className="space-y-3"
          >
            {translatedOptions.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label 
                  htmlFor={`option-${index}`}
                  className="cursor-pointer flex-1 p-2 rounded hover:bg-muted/50"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              {t('quiz.selectMultiple')}
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
            {t('quiz.welcome.title')}
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            {t('quiz.welcome.subtitle')}
          </p>
        </div>

        <Card className="text-left mb-8">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-500" />
              {t('quiz.welcome.features')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>✨ {t('quiz.welcome.feature1')}</li>
              <li>🎬 {t('quiz.welcome.feature2')}</li>
              <li>🌍 {t('quiz.welcome.feature3')}</li>
              <li>⏱️ {t('quiz.welcome.feature4')}</li>
            </ul>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-2 mb-6">
          <MapPin className="w-4 h-4" />
          <span className="text-sm text-muted-foreground">
            {t('quiz.welcome.region')}: {region.toUpperCase()}
          </span>
        </div>

        <Button 
          onClick={onStart}
          size="lg"
          className="w-full max-w-sm"
        >
          <Play className="w-4 h-4 mr-2" />
          {t('quiz.welcome.start')}
        </Button>
      </motion.div>
    </div>
  );
};

// Quiz Results Component
interface QuizResultsProps {
  recommendations: EnhancedMovieRecommendation[];
  region: string;
  onRestart: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({
  recommendations,
  region,
  onRestart
}) => {
  const { t } = useTranslation();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
        <h2 className="text-3xl font-bold mb-2">
          {t('quiz.results.title')}
        </h2>
        <p className="text-muted-foreground">
          {t('quiz.results.subtitle', { count: recommendations.length })}
        </p>
        
        <div className="flex justify-center gap-4 mt-4 text-sm text-muted-foreground">
          <span className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            {region.toUpperCase()}
          </span>
          <span className="flex items-center">
            <Star className="w-4 h-4 mr-1" />
            {recommendations.filter(r => r.streamingAvailability?.length).length} z dostępnością
          </span>
        </div>
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
        <CardContent className="p-6 text-center">
          <div className="flex gap-4 justify-center">
            <Button onClick={onRestart} variant="outline">
              {t('quiz.tryAgain')}
            </Button>
            <Button variant="outline">
              {t('quiz.saveRecommendations')}
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
  const { t } = useTranslation();

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
                {t('quiz.results.whyRecommended')}:
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
              <p className="text-xs font-medium">{t('quiz.results.availableOn')}:</p>
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
                <p>{t('quiz.results.availableInOtherRegions')}</p>
              ) : (
                <p>{t('quiz.results.noStreamingInfo')}</p>
              )}
            </div>
          )}

          <div className="flex gap-2 mt-3">
            {movie.trailer_url && (
              <Button size="sm" variant="outline" asChild>
                <a href={movie.trailer_url} target="_blank" rel="noopener noreferrer">
                  <Play className="w-3 h-3 mr-1" />
                  {t('quiz.results.trailer')}
                </a>
              </Button>
            )}
            <Button size="sm" variant="outline">
              {t('quiz.results.addToWatchlist')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EnhancedQuiz;
