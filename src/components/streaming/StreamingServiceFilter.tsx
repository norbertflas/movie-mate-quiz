import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface StreamingService {
  id: string;
  name: string;
  logo: string;
  color: string;
  available: boolean;
}

interface StreamingServiceFilterProps {
  country: string;
  selectedServices: string[];
  onServicesChange: (services: string[]) => void;
  availableServices?: string[];
  className?: string;
}

const getServicesForCountry = (country: string): StreamingService[] => {
  const servicesByCountry: Record<string, StreamingService[]> = {
    'pl': [
      { id: 'netflix', name: 'Netflix', logo: '/streaming-icons/netflix.svg', color: 'bg-red-600', available: true },
      { id: 'prime', name: 'Prime Video', logo: '/streaming-icons/prime.svg', color: 'bg-blue-600', available: true },
      { id: 'disney', name: 'Disney+', logo: '/streaming-icons/disney.svg', color: 'bg-blue-800', available: true },
      { id: 'hbo', name: 'HBO Max', logo: '/streaming-icons/hbomax.svg', color: 'bg-purple-600', available: true },
      { id: 'apple', name: 'Apple TV+', logo: '/streaming-icons/apple.svg', color: 'bg-gray-900', available: true },
      { id: 'canal', name: 'Canal+', logo: '/streaming-icons/default.svg', color: 'bg-black', available: true },
      { id: 'player', name: 'Player.pl', logo: '/streaming-icons/default.svg', color: 'bg-orange-500', available: true },
      { id: 'polsat', name: 'Polsat Box Go', logo: '/streaming-icons/default.svg', color: 'bg-yellow-500', available: true },
      { id: 'tvp', name: 'TVP VOD', logo: '/streaming-icons/default.svg', color: 'bg-red-700', available: true }
    ],
    'us': [
      { id: 'netflix', name: 'Netflix', logo: '/streaming-icons/netflix.svg', color: 'bg-red-600', available: true },
      { id: 'prime', name: 'Prime Video', logo: '/streaming-icons/prime.svg', color: 'bg-blue-600', available: true },
      { id: 'disney', name: 'Disney+', logo: '/streaming-icons/disney.svg', color: 'bg-blue-800', available: true },
      { id: 'hbo', name: 'HBO Max', logo: '/streaming-icons/hbomax.svg', color: 'bg-purple-600', available: true },
      { id: 'apple', name: 'Apple TV+', logo: '/streaming-icons/apple.svg', color: 'bg-gray-900', available: true },
      { id: 'hulu', name: 'Hulu', logo: '/streaming-icons/hulu.svg', color: 'bg-green-500', available: true },
      { id: 'paramount', name: 'Paramount+', logo: '/streaming-icons/paramount.svg', color: 'bg-blue-500', available: true }
    ]
  };

  return servicesByCountry[country] || servicesByCountry['us'];
};

export const StreamingServiceFilter = ({
  country,
  selectedServices,
  onServicesChange,
  availableServices = [],
  className = ''
}: StreamingServiceFilterProps) => {
  const [services, setServices] = useState<StreamingService[]>([]);

  useEffect(() => {
    const countryServices = getServicesForCountry(country);
    
    // Mark services as available/unavailable based on actual data
    const updatedServices = countryServices.map(service => ({
      ...service,
      available: availableServices.length === 0 || availableServices.some(
        available => available.toLowerCase().includes(service.name.toLowerCase()) ||
                    service.name.toLowerCase().includes(available.toLowerCase())
      )
    }));
    
    setServices(updatedServices);
  }, [country, availableServices]);

  const toggleService = (serviceId: string) => {
    const newSelected = selectedServices.includes(serviceId)
      ? selectedServices.filter(id => id !== serviceId)
      : [...selectedServices, serviceId];
    
    onServicesChange(newSelected);
  };

  const clearAll = () => {
    onServicesChange([]);
  };

  const hasActiveFilters = selectedServices.length > 0;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Serwisy streamingowe</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Wyczyść filtry
          </Button>
        )}
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {selectedServices.map(serviceId => {
            const service = services.find(s => s.id === serviceId);
            if (!service) return null;
            
            return (
              <Badge
                key={serviceId}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive/20"
                onClick={() => toggleService(serviceId)}
              >
                {service.name}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            );
          })}
        </div>
      )}

      {/* Service selection buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {services.map(service => {
          const isSelected = selectedServices.includes(service.id);
          const isAvailable = service.available;
          
          return (
            <Button
              key={service.id}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => toggleService(service.id)}
              disabled={!isAvailable}
              className={`
                flex flex-col items-center p-3 h-auto space-y-2 transition-all
                ${isSelected ? `${service.color} text-white` : ''}
                ${!isAvailable ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
              `}
            >
              <img
                src={service.logo}
                alt={service.name}
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/streaming-icons/default.svg';
                }}
              />
              <span className="text-xs font-medium text-center leading-tight">
                {service.name}
              </span>
              {!isAvailable && (
                <span className="text-xs opacity-60">(niedostępny)</span>
              )}
            </Button>
          );
        })}
      </div>

      {availableServices.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Dostępne serwisy: {availableServices.length > 0 ? availableServices.join(', ') : 'Brak danych'}
        </div>
      )}
    </div>
  );
};

export default StreamingServiceFilter;