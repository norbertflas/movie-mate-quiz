
import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const services = [
  {
    name: "NETFLIX",
    glow: "hover:shadow-[0_0_30px_rgba(229,9,20,0.3)]",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
  },
  {
    name: "Disney+",
    glow: "hover:shadow-[0_0_30px_rgba(0,114,210,0.3)]",
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg",
  },
  {
    name: "HBO Max",
    glow: "hover:shadow-[0_0_30px_rgba(147,51,234,0.3)]",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/17/HBO_Max_Logo.svg",
  },
  {
    name: "Prime Video",
    glow: "hover:shadow-[0_0_30px_rgba(0,168,225,0.3)]",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.png",
  },
  {
    name: "Hulu",
    glow: "hover:shadow-[0_0_30px_rgba(28,231,131,0.3)]",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Hulu_Logo.svg",
  },
];

export const StreamingServicesSelector = () => {
  const [selected, setSelected] = useState<string[]>(["Disney+"]);

  const toggle = (name: string) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  return (
    <section className="px-8 py-32 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
        <div>
          <h2 className="text-4xl font-bold mb-4 font-display text-white">
            Streaming Services
          </h2>
          <p className="text-white/40">
            Select the platforms you have access to for better results.
          </p>
        </div>
        <div className="text-sm text-purple-400 font-bold uppercase tracking-widest">
          {selected.length} Selected
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {services.map((service) => (
          <motion.button
            whileHover={{ y: -8 }}
            key={service.name}
            onClick={() => toggle(service.name)}
            className={`relative h-36 rounded-3xl flex items-center justify-center p-8 transition-all duration-500 glass-card ${service.glow} ${
              selected.includes(service.name)
                ? "ring-2 ring-purple-500/50 bg-white/10"
                : "opacity-40 grayscale hover:grayscale-0 hover:opacity-100"
            }`}
          >
            <div className="absolute top-4 right-4">
              <div
                className={`w-6 h-6 rounded-lg border-2 ${
                  selected.includes(service.name)
                    ? "bg-purple-500 border-purple-500"
                    : "border-white/20"
                } flex items-center justify-center transition-colors`}
              >
                {selected.includes(service.name) && (
                  <Check className="w-4 h-4 text-white" />
                )}
              </div>
            </div>
            <img
              src={service.logo}
              alt={service.name}
              className="max-h-14 max-w-[85%] object-contain drop-shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </motion.button>
        ))}
      </div>
    </section>
  );
};
