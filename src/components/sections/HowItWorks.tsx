
import { motion } from "framer-motion";
import { MonitorSmartphone, Clock, Trophy } from "lucide-react";

const steps = [
  {
    number: "1",
    icon: MonitorSmartphone,
    title: "Select Your Services",
    description: "Tell us which platforms you subscribe to.",
    color: "text-neon-cyan",
    borderColor: "border-[hsl(var(--neon-cyan)/0.3)]",
  },
  {
    number: "2",
    icon: Clock,
    title: "Take the 1-minute Quiz",
    description: "Answer a few quick questions about your mood and preferences.",
    color: "text-neon-magenta",
    borderColor: "border-[hsl(var(--neon-magenta)/0.3)]",
  },
  {
    number: "3",
    icon: Trophy,
    title: "Get Your Perfect Match",
    description: "Receive a curated list of top-rated recommendations instantly.",
    color: "text-neon-green",
    borderColor: "border-[hsl(var(--neon-green)/0.3)]",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
          How it Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              className={`neon-card ${step.borderColor} p-8 relative overflow-hidden group`}
            >
              {/* Large number */}
              <span className={`text-5xl font-bold ${step.color} opacity-80 mb-3 block`}>
                {step.number}
              </span>
              
              {/* Icon */}
              <step.icon className={`h-10 w-10 ${step.color} mb-4 opacity-70`} />
              
              <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
