
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MOVIE_POSTERS = [
  "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1542204172-3c1f81706f21?auto=format&fit=crop&q=80&w=1000",
];

export const DynamicBackground = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % MOVIE_POSTERS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="animated-glow top-[-10%] left-[-10%]" />
      <div
        className="animated-glow bottom-[-10%] right-[-10%] opacity-50"
        style={{ animationDelay: "-5s" }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.15 }}
          animate={{ opacity: 0.2, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img
            src={MOVIE_POSTERS[index]}
            alt=""
            className="w-full h-full object-cover blur-[2px]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#02020a]/90 via-[#02020a]/40 to-[#02020a]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#02020a] via-transparent to-[#02020a] opacity-60" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
