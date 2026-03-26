import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { FilmGrain } from "@/components/effects/FilmGrain";
import { MouseGlow } from "@/components/effects/MouseGlow";
import { DynamicBackground } from "@/components/effects/DynamicBackground";
import EnhancedQuiz from "@/components/quiz/EnhancedQuiz";
import { useNavigate } from "react-router-dom";

const QuizPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#02020a] selection:bg-purple-500/30">
      <DynamicBackground />
      <MouseGlow />
      <FilmGrain />

      <div className="relative z-10">
        <Navigation />

        <main className="pt-32 pb-16">
          <EnhancedQuiz
            onBack={() => navigate("/")}
            onComplete={(results) => {
              console.log("Quiz completed:", results);
            }}
          />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default QuizPage;
