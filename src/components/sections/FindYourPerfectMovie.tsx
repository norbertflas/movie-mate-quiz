
import { motion } from "framer-motion";
import { Sparkles, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FindYourPerfectMovieProps {
  onStartQuiz: () => void;
}

export const FindYourPerfectMovie = ({ onStartQuiz }: FindYourPerfectMovieProps) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="py-12"
    >
      <Card className="bg-gradient-to-br from-primary/10 via-blue-500/10 to-purple-500/10 border-primary/20">
        <CardContent className="p-8 text-center">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Find your perfect movie
                </h2>
                <Sparkles className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Odpowiedz na kilka pytań, a my znajdziemy idealne filmy dopasowane do Twoich preferencji
              </p>
            </div>

            {/* Features */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                Personalizowane rekomendacje
              </Badge>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-600 border-blue-500/30">
                Dostępność w serwisach
              </Badge>
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-600 border-purple-500/30">
                Inteligentny matching
              </Badge>
            </div>

            {/* Search Input Mockup */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <div className="w-full pl-10 pr-4 py-3 bg-background/50 border border-border rounded-lg text-muted-foreground">
                  Wpisz tytuł filmu...
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3 justify-center">
                <Badge variant="outline" className="text-xs">Action</Badge>
                <Badge variant="outline" className="text-xs">Comedy</Badge>
                <Badge variant="outline" className="text-xs">Drama</Badge>
                <Badge variant="outline" className="text-xs">Sci-Fi</Badge>
              </div>
            </div>

            {/* CTA Button */}
            <Button 
              size="lg" 
              onClick={onStartQuiz}
              className="group relative px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-primary via-blue-600 to-purple-600 hover:from-primary/90 hover:via-blue-600/90 hover:to-purple-600/90"
            >
              <span className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 transition-transform group-hover:scale-110 group-hover:rotate-12" />
                <span>Rozpocznij Quiz Filmowy</span>
              </span>
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.section>
  );
};
