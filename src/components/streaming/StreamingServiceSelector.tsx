
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

interface StreamingService {
  id: string;
  name: string;
  logo: string;
  color: string;
  available_countries: string[];
}

const STREAMING_SERVICES: Record<string, StreamingService> = {
  netflix: {
    id: 'netflix',
    name: 'Netflix',
    logo: '/streaming-icons/netflix.svg',
    color: '#E50914',
    available_countries: ['pl', 'us', 'gb', 'de', 'fr', 'es', 'it']
  },
  prime: {
    id: 'prime',
    name: 'Amazon Prime Video',
    logo: '/streaming-icons/prime.svg',
    color: '#00A8E1',
    available_countries: ['pl', 'us', 'gb', 'de', 'fr', 'es', 'it']
  },
  disney: {
    id: 'disney',
    name: 'Disney+',
    logo: '/streaming-icons/disney.svg',
    color: '#113CCF',
    available_countries: ['pl', 'us', 'gb', 'de', 'fr', 'es']
  },
  hbo: {
    id: 'hbo',
    name: 'HBO Max',
    logo: '/streaming-icons/hbomax.svg',
    color: '#9B59B6',
    available_countries: ['pl', 'us']
  },
  apple: {
    id: 'apple',
    name: 'Apple TV+',
    logo: '/streaming-icons/apple.svg',
    color: '#000000',
    available_countries: ['pl', 'us', 'gb', 'de', 'fr']
  },
  paramount: {
    id: 'paramount',
    name: 'Paramount+',
    logo: '/streaming-icons/paramount.svg',
    color: '#0064FF',
    available_countries: ['us', 'gb']
  }
};

interface StreamingServiceSelectorProps {
  selectedServices: string[];
  onServicesChange: (services: string[]) => void;
  country: string;
  className?: string;
  showLabel?: boolean;
}

export function StreamingServiceSelector({ 
  selectedServices, 
  onServicesChange, 
  country,
  className = "",
  showLabel = true
}: StreamingServiceSelectorProps) {
  const { t } = useTranslation();
  
  // Filter services available in country
  const availableServices = Object.values(STREAMING_SERVICES).filter(service =>
    service.available_countries.includes(country)
  );

  const toggleService = (serviceId: string) => {
    if (selectedServices.includes(serviceId)) {
      onServicesChange(selectedServices.filter(id => id !== serviceId));
    } else {
      onServicesChange([...selectedServices, serviceId]);
    }
  };

  return (
    <div className={className}>
      {showLabel && (
        <h3 className="text-lg font-semibold mb-4">
          {t("filters.platform")}
        </h3>
      )}
      
      <div className="flex flex-wrap gap-3">
        {availableServices.map(service => {
          const isSelected = selectedServices.includes(service.id);
          
          return (
            <motion.button
              key={service.id}
              onClick={() => toggleService(service.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                relative flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' 
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:shadow-sm'
                }
              `}
            >
              <img 
                src={service.logo} 
                alt={service.name}
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="text-sm font-medium">{service.name}</span>
              
              {isSelected && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-white" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
      
      {selectedServices.length > 0 && (
        <div className="mt-3 text-sm text-gray-600">
          {t("common.selected")}: {selectedServices.length} {t("services.services")}
        </div>
      )}
    </div>
  );
}
