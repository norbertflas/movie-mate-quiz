
import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const services = [
  { id: "netflix", name: "Netflix", logo: "/streaming-icons/netflix.svg", color: "from-red-900/40 to-red-800/20" },
  { id: "disney", name: "Disney+", logo: "/streaming-icons/disneyplus.svg", color: "from-blue-900/40 to-blue-800/20" },
  { id: "hbomax", name: "HBO Max", logo: "/streaming-icons/max.svg", color: "from-purple-900/40 to-purple-800/20" },
  { id: "prime", name: "Prime Video", logo: "/streaming-icons/prime.svg", color: "from-cyan-900/40 to-cyan-800/20" },
  { id: "hulu", name: "Hulu", logo: "/streaming-icons/hulu.svg", color: "from-green-900/40 to-green-800/20" },
];

export const StreamingServicesSelector = () => {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleService = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-foreground mb-8">Streaming Services</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {services.map((service, index) => (
            <motion.button
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => toggleService(service.id)}
              className={`relative bg-gradient-to-br ${service.color} border rounded-2xl p-6 flex flex-col items-center justify-center gap-3 h-28 transition-all duration-300 ${
                selected.includes(service.id) 
                  ? 'border-neon-cyan shadow-lg shadow-accent/20' 
                  : 'border-border/40 hover:border-border'
              }`}
            >
              {/* Checkbox */}
              <div className={`absolute top-3 right-3 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                selected.includes(service.id) 
                  ? 'bg-accent border-accent' 
                  : 'border-muted-foreground/40'
              }`}>
                {selected.includes(service.id) && <Check className="w-3 h-3 text-white" />}
              </div>
              
              <img 
                src={service.logo} 
                alt={service.name} 
                className="h-10 w-auto object-contain opacity-90"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <span className="text-sm font-medium text-foreground/80">{service.name}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};
