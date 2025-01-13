import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { SearchSection } from "@/components/sections/SearchSection";
import { PageContainer } from "@/components/home/PageContainer";
import { ServicesSection } from "@/components/home/ServicesSection";
import { QuizContent } from "@/components/home/QuizContent";
import { TrendingMoviesSection } from "@/components/sections/TrendingMoviesSection";
import { RecentlyViewedSection } from "@/components/sections/RecentlyViewedSection";
import { InfiniteMovieList } from "@/components/movie/InfiniteMovieList";

const Index = () => {
  const [showQuiz, setShowQuiz] = useState(false);
  const { t } = useTranslation();

  const handleStartQuiz = () => {
    setShowQuiz(true);
  };

  return (
    <PageContainer>
      <ServicesSection />
      <SearchSection />
      <div className="space-y-8">
        <TrendingMoviesSection />
        <RecentlyViewedSection />
        {!showQuiz ? (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold">{t("discover.popular")}</h2>
            <InfiniteMovieList />
          </div>
        ) : (
          <QuizContent />
        )}
      </div>
    </PageContainer>
  );
};

export default Index;