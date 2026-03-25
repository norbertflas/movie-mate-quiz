
import { motion } from "framer-motion";
import { MonitorSmartphone, Timer, Trophy } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: <MonitorSmartphone className="w-10 h-10 text-blue-400" />,
    title: "Select Your Services",
    desc: "Tell us which platforms you subscribe to so we can find available content.",
    color: "border-blue-500/30",
  },
  {
    number: "02",
    icon: <Timer className="w-10 h-10 text-purple-400" />,
    title: "Take the 1-minute Quiz",
    desc: "Answer a few quick questions about your mood, genre preferences, and past favorites.",
    color: "border-purple-500/30",
  },
  {
    number: "03",
    icon: <Trophy className="w-10 h-10 text-pink-400" />,
    title: "Get Your Perfect Match",
    desc: "Receive a curated list of top-rated recommendations tailored specifically for you.",
    color: "border-pink-500/30",
  },
];

export const HowItWorks = () => {
  return (
    <section className="px-8 py-32 max-w-7xl mx-auto">
      <div className="text-center mb-20">
        <h2 className="text-5xl font-black mb-6 font-display text-white">
          How it Works
        </h2>
        <p className="text-white/40 max-w-2xl mx-auto text-lg">
          Our AI engine analyzes thousands of data points to find your next
          favorite watch in seconds.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-10">
        {steps.map((step) => (
          <motion.div
            whileHover={{ y: -10 }}
            key={step.number}
            className={`relative p-10 rounded-[2.5rem] glass-card border-t-2 ${step.color} overflow-hidden group transition-all`}
          >
            <div className="absolute -top-6 -right-6 text-[10rem] font-black step-number-bg opacity-5 group-hover:opacity-10 transition-opacity select-none font-display">
              {step.number}
            </div>
            <div className="relative z-10">
              <div className="mb-8 p-4 bg-white/5 rounded-2xl w-fit shadow-inner">
                {step.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 font-display text-white">
                {step.title}
              </h3>
              <p className="text-white/40 leading-relaxed text-lg font-light">
                {step.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
