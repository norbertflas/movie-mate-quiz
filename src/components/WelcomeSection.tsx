import { Button } from "./ui/button";
import { PlayCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface WelcomeSectionProps {
  onStartQuiz: () => void;
}

export const WelcomeSection = ({ onStartQuiz }: WelcomeSectionProps) => {
  return (
    <div className="relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-8 py-16 px-4"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold tracking-tight"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
              Znajdź swój idealny film
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Odpowiedz na kilka pytań, a my pomożemy Ci odkryć Twój następny ulubiony film lub serial
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="max-w-2xl mx-auto text-muted-foreground space-y-4"
          >
            <p>
              MovieFinder to innowacyjna platforma, która wykorzystuje zaawansowane algorytmy, 
              aby dopasować filmy do Twoich preferencji. Nasz inteligentny quiz analizuje Twoje 
              upodobania i sugeruje idealne filmy dla Ciebie.
            </p>
            <p>
              Nie trać czasu na przeszukiwanie niekończących się list filmów. 
              Pozwól nam znaleźć dokładnie to, czego szukasz.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="pt-8"
          >
            <Button 
              size="lg" 
              onClick={onStartQuiz}
              className="group relative px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 hover:from-blue-700 hover:via-violet-700 hover:to-purple-700"
            >
              <span className="flex items-center gap-3">
                <PlayCircle className="h-6 w-6 transition-transform group-hover:scale-110" />
                <span className="font-semibold">Rozpocznij quiz</span>
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