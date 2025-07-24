import { Badge } from "@/components/ui/badge";
import { StreamingOption } from "@/hooks/use-streaming-pro";

interface StreamingBadgeProps {
  streamingOptions: StreamingOption[];
  mode?: 'compact' | 'detailed';
  maxServices?: number;
}

const getServiceColor = (serviceName: string): string => {
  const colors: Record<string, string> = {
    'Netflix': 'bg-red-600 text-white border-red-600',
    'Amazon Prime Video': 'bg-blue-600 text-white border-blue-600',
    'Disney+': 'bg-blue-800 text-white border-blue-800',
    'HBO Max': 'bg-purple-600 text-white border-purple-600',
    'Apple TV+': 'bg-gray-900 text-white border-gray-900',
    'Hulu': 'bg-green-500 text-white border-green-500',
    'Paramount+': 'bg-blue-500 text-white border-blue-500',
    'Canal+': 'bg-black text-white border-black',
    'Player.pl': 'bg-orange-500 text-white border-orange-500',
    'Polsat Box Go': 'bg-yellow-500 text-black border-yellow-500',
    'TVP VOD': 'bg-red-700 text-white border-red-700'
  };
  
  return colors[serviceName] || 'bg-gray-600 text-white border-gray-600';
};

const getTypeIcon = (type: string): string => {
  switch (type) {
    case 'subscription': return '∞';
    case 'rent': return '⏰';
    case 'buy': return '💰';
    case 'free': return '🆓';
    default: return '▶';
  }
};

export const StreamingBadge = ({ 
  streamingOptions, 
  mode = 'compact', 
  maxServices = 3 
}: StreamingBadgeProps) => {
  if (!streamingOptions || streamingOptions.length === 0) {
    return (
      <Badge variant="outline" className="text-xs opacity-60">
        Brak streamingu
      </Badge>
    );
  }

  // Get unique services (in case there are multiple options per service)
  const uniqueServices = streamingOptions.reduce((acc, option) => {
    const existing = acc.find(s => s.service === option.service);
    if (!existing) {
      acc.push(option);
    } else {
      // Keep the best option (subscription > free > rent > buy)
      const priority = { subscription: 4, free: 3, rent: 2, buy: 1 };
      if ((priority[option.type] || 0) > (priority[existing.type] || 0)) {
        acc[acc.indexOf(existing)] = option;
      }
    }
    return acc;
  }, [] as StreamingOption[]);

  if (mode === 'compact') {
    const servicesToShow = uniqueServices.slice(0, maxServices);
    const remainingCount = uniqueServices.length - maxServices;

    return (
      <div className="absolute top-2 right-2 flex flex-col gap-1">
        {servicesToShow.map((option, index) => (
          <Badge
            key={`${option.service}-${index}`}
            className={`text-xs px-2 py-1 ${getServiceColor(option.service)}`}
          >
            <span className="mr-1">{getTypeIcon(option.type)}</span>
            {option.service.split(' ')[0]} {/* Show only first word for space */}
          </Badge>
        ))}
        {remainingCount > 0 && (
          <Badge variant="outline" className="text-xs px-2 py-1">
            +{remainingCount}
          </Badge>
        )}
      </div>
    );
  }

  // Detailed mode - show all services
  return (
    <div className="flex flex-wrap gap-2">
      {uniqueServices.map((option, index) => (
        <Badge
          key={`${option.service}-${index}`}
          className={`text-sm px-3 py-1 ${getServiceColor(option.service)} hover:opacity-80 transition-opacity cursor-pointer`}
          onClick={() => window.open(option.link, '_blank')}
        >
          <span className="mr-2">{getTypeIcon(option.type)}</span>
          {option.service}
          {option.quality && (
            <span className="ml-2 text-xs opacity-80">{option.quality}</span>
          )}
          {option.price && (
            <span className="ml-2 text-xs">{option.price.formatted}</span>
          )}
        </Badge>
      ))}
    </div>
  );
};

export default StreamingBadge;
