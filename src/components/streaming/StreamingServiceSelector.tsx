
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { getSupportedServices, getUserCountry } from "@/services/streamingAvailabilityPro";

interface StreamingServiceSelectorProps {
  selectedServices: string[];
  onServicesChange: (services: string[]) => void;
  country?: string;
  showLabel?: boolean;
}

const serviceLogos: Record<string, string> = {
  'Netflix': '/streaming-icons/netflix.svg',
  'Amazon Prime Video': '/streaming-icons/prime.svg',
  'Disney+': '/streaming-icons/disney.svg',
  'HBO Max': '/streaming-icons/hbo.svg',
  'Apple TV+': '/streaming-icons/apple.svg',
  'Hulu': '/streaming-icons/hulu.svg',
  'Paramount+': '/streaming-icons/paramount.svg',
  'Peacock': '/streaming-icons/peacock.svg',
  'Canal+': '/streaming-icons/canal.svg',
  'Player.pl': '/streaming-icons/player.svg'
};

const serviceColors: Record<string, string> = {
  'Netflix': 'bg-red-600 hover:bg-red-700',
  'Amazon Prime Video': 'bg-blue-600 hover:bg-blue-700',
  'Disney+': 'bg-blue-700 hover:bg-blue-800',
  'HBO Max': 'bg-purple-600 hover:bg-purple-700',
  'Apple TV+': 'bg-gray-800 hover:bg-gray-900',
  'Hulu': 'bg-green-600 hover:bg-green-700',
  'Paramount+': 'bg-blue-500 hover:bg-blue-600',
  'Peacock': 'bg-purple-500 hover:bg-purple-600',
  'Canal+': 'bg-black hover:bg-gray-900',
  'Player.pl': 'bg-red-500 hover:bg-red-600'
};

export const StreamingServiceSelector = ({
  selectedServices,
  onServicesChange,
  country,
  showLabel = false
}: StreamingServiceSelectorProps) => {
  const targetCountry = country || getUserCountry();
  const supportedServices = getSupportedServices(targetCountry);

  const toggleService = (service: string) => {
    if (selectedServices.includes(service)) {
      onServicesChange(selectedServices.filter(s => s !== service));
    } else {
      onServicesChange([...selectedServices, service]);
    }
  };

  const clearAll = () => {
    onServicesChange([]);
  };

  return (
    <div className="space-y-3">
      {showLabel && (
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Filter by Streaming Service</h3>
          {selectedServices.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-xs"
            >
              Clear all
            </Button>
          )}
        </div>
      )}
      
      <div className="flex flex-wrap gap-2">
        {supportedServices.map((service) => {
          const isSelected = selectedServices.includes(service);
          const colorClass = serviceColors[service] || 'bg-gray-600 hover:bg-gray-700';
          
          return (
            <Button
              key={service}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => toggleService(service)}
              className={`flex items-center gap-2 h-8 px-3 ${
                isSelected ? colorClass : 'border-gray-600 hover:bg-gray-700'
              } transition-colors`}
            >
              <img
                src={serviceLogos[service] || '/streaming-icons/default.svg'}
                alt={service}
                className="w-4 h-4 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <span className="text-xs font-medium">{service}</span>
              {isSelected && <Check className="w-3 h-3" />}
            </Button>
          );
        })}
      </div>
      
      {selectedServices.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Selected:</span>
          <div className="flex flex-wrap gap-1">
            {selectedServices.map((service) => (
              <Badge key={service} variant="secondary" className="text-xs">
                {service}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
