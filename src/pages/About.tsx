
import { motion } from "framer-motion";
import { Rocket, Brain, Users, Sparkles } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { MouseGlow } from "@/components/effects/MouseGlow";
import { Footer } from "@/components/Footer";

const About = () => {
  const timeline = [
    {
      year: "2023",
      title: "The Vision",
      desc: "MovieFinder was born from a simple idea: stop scrolling, start watching.",
      icon: <Rocket className="w-6 h-6" />,
    },
    {
      year: "2024",
      title: "AI Integration",
      desc: "We integrated Gemini AI to provide truly personalized recommendations.",
      icon: <Brain className="w-6 h-6" />,
    },
    {
      year: "2025",
      title: "Global Launch",
      desc: "Our community grew to 1 million movie lovers worldwide.",
      icon: <Users className="w-6 h-6" />,
    },
    {
      year: "2026",
      title: "The Future",
      desc: "Expanding into VR cinema experiences and social watch parties.",
      icon: <Sparkles className="w-6 h-6" />,
    },
  ];

  const techStack = [
    "React", "TypeScript", "Tailwind CSS", "Framer Motion", "Supabase",
    "TMDB API", "Gemini AI", "Vite", "Lucide Icons",
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#02020a] selection:bg-purple-500/30">
      <MouseGlow />

      {/* Vertical side text */}
      <div className="fixed left-8 top-1/2 -translate-y-1/2 z-20 hidden xl:block">
        <div className="text-white/5 font-black text-xs uppercase tracking-[0.5em] font-display" style={{ writingMode: "vertical-rl" }}>
          EST. 2024
        </div>
      </div>
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-20 hidden xl:block">
        <div className="text-white/5 font-black text-xs uppercase tracking-[0.5em] font-display" style={{ writingMode: "vertical-rl" }}>
          MOVIEFINDER PROD.
        </div>
      </div>

      <div className="relative z-10">
        <Navigation />

        <div className="pt-40 px-8 max-w-7xl mx-auto pb-32">
          {/* Hero Section */}
          <div className="text-center mb-32">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl sm:text-8xl font-black mb-6 font-display tracking-tight leading-[0.9]"
            >
              <span className="text-white">CRAFTING</span>
              <br />
              <span className="text-gradient-hero">CINEMATIC</span>
              <br />
              <span className="text-white">DISCOVERY</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-white/30 text-xl max-w-2xl mx-auto leading-loose"
              style={{ fontFamily: "Georgia, serif" }}
            >
              We are on a mission to revolutionize how you discover cinema.
              Every recommendation is a story waiting to be experienced.
            </motion.p>
          </div>

          {/* Mission Section */}
          <div className="max-w-3xl mx-auto text-center mb-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-4xl font-black font-display text-white uppercase tracking-tight">
                Our Mission
              </h2>
              <p
                className="text-white/40 text-xl leading-loose"
                style={{ fontFamily: "Georgia, serif" }}
              >
                In a world oversaturated with content, we believe finding the
                perfect movie shouldn't feel like searching for a needle in a
                haystack. MovieFinder combines cutting-edge AI with a deep love
                for cinema to create an experience that feels less like browsing
                and more like having a conversation with your most knowledgeable
                film-buff friend.
              </p>
            </motion.div>
          </div>

          {/* Timeline */}
          <div className="grid lg:grid-cols-2 gap-20 items-center mb-32">
            <div className="space-y-12">
              {timeline.map((item, i) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="flex gap-8 group"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-600/20 group-hover:border-purple-500/30 transition-all">
                      {item.icon}
                    </div>
                    {i < timeline.length - 1 && (
                      <div className="w-px h-full bg-white/5 mt-4" />
                    )}
                  </div>
                  <div className="pb-12">
                    <span className="text-purple-400 font-black text-xs uppercase tracking-widest">
                      {item.year}
                    </span>
                    <h3 className="text-2xl font-black text-white mt-2 mb-3 font-display">
                      {item.title}
                    </h3>
                    <p className="text-white/30 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Team portraits */}
            <div className="grid grid-cols-2 gap-6">
              {[
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
                "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400",
                "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400",
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400",
              ].map((img, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative aspect-[3/4] rounded-[2rem] overflow-hidden border border-white/5"
                >
                  <img
                    src={img}
                    alt="Team member"
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#02020a] via-transparent to-transparent opacity-60" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Tech Stack Marquee */}
          <div className="mb-32">
            <h2 className="text-center text-white/20 font-black text-xs uppercase tracking-[0.3em] mb-12 font-display">
              Powered By
            </h2>
            <div className="overflow-hidden relative">
              <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#02020a] to-transparent z-10" />
              <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#02020a] to-transparent z-10" />
              <motion.div
                animate={{ x: [0, -1200] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="flex gap-12 whitespace-nowrap"
              >
                {[...techStack, ...techStack, ...techStack].map((tech, i) => (
                  <div
                    key={`${tech}-${i}`}
                    className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 font-bold text-sm uppercase tracking-widest flex-shrink-0 hover:bg-white/10 hover:text-white transition-all"
                  >
                    {tech}
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-32">
            {[
              { value: "500K+", label: "Movies Indexed" },
              { value: "50+", label: "Streaming Platforms" },
              { value: "1M+", label: "Happy Users" },
              { value: "99%", label: "Match Accuracy" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-8 rounded-[2.5rem] glass-card"
              >
                <div className="text-4xl font-black text-white font-display mb-2">
                  {stat.value}
                </div>
                <div className="text-white/30 text-xs font-bold uppercase tracking-widest">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default About;
