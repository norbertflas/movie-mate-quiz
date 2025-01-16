import { Button } from "./ui/button";
import { PlayCircle, Sparkles, Star, Film, Heart } from "lucide-react";
import { motion } from "framer-motion";

interface WelcomeSectionProps {
  onStartQuiz: () => void;
}

export const WelcomeSection = ({ onStartQuiz }: WelcomeSectionProps) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="text-center space-y-8 py-16 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto space-y-8">
          <motion.div variants={item} className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                Odkryj magię kina
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground">
              Twoja osobista podróż przez świat filmu zaczyna się tutaj
            </p>
          </motion.div>

          <motion.div variants={item} className="grid gap-6 sm:grid-cols-3">
            <div className="flex flex-col items-center p-4 rounded-lg bg-card/50">
              <Film className="h-8 w-8 mb-2 text-blue-500" />
              <h3 className="font-semibold">Personalizowane rekomendacje</h3>
              <p className="text-sm text-muted-foreground">Filmy dobrane specjalnie dla Ciebie</p>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg bg-card/50">
              <Star className="h-8 w-8 mb-2 text-violet-500" />
              <h3 className="font-semibold">Inteligentny quiz</h3>
              <p className="text-sm text-muted-foreground">Poznaj swoje filmowe preferencje</p>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg bg-card/50">
              <Heart className="h-8 w-8 mb-2 text-purple-500" />
              <h3 className="font-semibold">Społeczność kinomaniaków</h3>
              <p className="text-sm text-muted-foreground">Dziel się swoimi odkryciami</p>
            </div>
          </motion.div>

          <motion.div variants={item} className="space-y-4 max-w-2xl mx-auto">
            <p className="text-lg text-muted-foreground">
              MovieFinder to więcej niż tylko wyszukiwarka filmów. To Twój osobisty przewodnik 
              po świecie kina, który pomoże Ci odkryć filmy idealnie dopasowane do Twoich upodobań.
            </p>
            <p className="text-lg text-muted-foreground">
              Rozpocznij swoją przygodę już teraz i pozwól nam pomóc Ci znaleźć 
              Twój następny ulubiony film.
            </p>
          </motion.div>

          <motion.div
            variants={item}
            className="pt-8"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              size="lg" 
              onClick={onStartQuiz}
              className="group relative px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 hover:from-blue-700 hover:via-violet-700 hover:to-purple-700"
            >
              <span className="flex items-center gap-3">
                <PlayCircle className="h-6 w-6 transition-transform group-hover:scale-110" />
                <span className="font-semibold">Rozpocznij swoją filmową podróż</span>
                <Sparkles className="h-5 w-5 animate-pulse" />
              </span>
            </Button>
          </motion.div>
        </div>
      </motion.div>
      
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),transparent)] dark:bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.900),transparent)] opacity-20" />
    </div>
  );
};