import { motion } from "framer-motion";
import { SearchSection } from "./SearchSection";
import { TrendingMoviesSection } from "./TrendingMoviesSection";
import { RecentlyViewedSection } from "./RecentlyViewedSection";
import { InfiniteMovieList } from "../movie/InfiniteMovieList";
import { useTranslation } from "react-i18next";

export const MainContent = () => {
  const { t } = useTranslation();

  return (
    <motion.div
      key="content"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12 w-full"
    >
      <SearchSection />
      <TrendingMoviesSection />
      <RecentlyViewedSection />

      <section className="glass-panel p-6 rounded-xl w-full">
        <h2 className="text-2xl font-bold mb-6 gradient-text">
          {t("discover.popular")}
        </h2>
        <div className="w-full max-h-[800px] overflow-y-auto">
          <InfiniteMovieList />
        </div>
      </section>
    </motion.div>
  );
};