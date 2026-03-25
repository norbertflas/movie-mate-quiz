
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[70vh] flex items-center overflow-hidden cosmic-bg">
      {/* Animated nebula blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-[hsl(270,60%,40%)] rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-pulse" />
        <div className="absolute top-10 right-1/4 w-[500px] h-[350px] bg-[hsl(310,60%,35%)] rounded-full mix-blend-screen filter blur-[100px] opacity-25 animate-pulse delay-1000" />
        <div className="absolute top-20 left-1/2 w-[400px] h-[300px] bg-[hsl(200,60%,30%)] rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-pulse delay-2000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
            <span className="text-gradient-neon">Find Your Next</span>
            <br />
            <span className="text-gradient-neon">Obsession</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
            Get personalized movie and series recommendations based on your taste and streaming service availability.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => navigate("/quiz")}
              size="lg"
              className="btn-gradient px-10 py-6 text-lg"
            >
              Start the Quiz
            </Button>

            <Button
              onClick={() => navigate("/search")}
              variant="outline"
              size="lg"
              className="btn-outline-glow px-10 py-6 text-lg"
            >
              Browse Popular
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
