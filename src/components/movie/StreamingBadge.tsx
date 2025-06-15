
import { Badge } from "@/components/ui/badge";
import { type StreamingOption } from "@/services/streamingAvailabilityPro";

interface StreamingBadgeProps {
  streamingOptions: StreamingOption[];
  compact?: boolean;
  maxShow?: number;
}

const serviceColors: Record<string, string> = {
  'Netflix': 'bg-red-600/80 text-white',
  'Amazon Prime Video': 'bg-blue-600/80 text-white',
  'Disney+': 'bg-blue-700/80 text-white',
  'HBO Max': 'bg-purple-600/80 text-white',
  'Apple TV+': 'bg-gray-800/80 text-white',
  'Hulu': 'bg-green-600/80 text-white',
  'Paramount+': 'bg-blue-500/80 text-white',
  'Peacock': 'bg-purple-500/80 text-white'
};

const typeIcons: Record<string, string> = {
  'subscription': '∞',
  'rent': '$',
  'buy': '💰',
  'free': '★'
};

export const StreamingBadge = ({ 
  streamingOptions, 
  compact = false, 
  maxShow = 2 
}: StreamingBadgeProps) => {
  if (!streamingOptions.length) return null;

  const displayOptions = streamingOptions.slice(0, maxShow);
  const remainingCount = streamingOptions.length - maxShow;

  if (compact) {
    return (
      <div className="absolute top-2 right-2 flex flex-col gap-1">
        {displayOptions.map((option, index) => {
          const colorClass = serviceColors[option.service] || 'bg-gray-600/80 text-white';
          return (
            <Badge
              key={index}
              className={`text-xs px-2 py-1 ${colorClass} backdrop-blur-sm`}
            >
              <span className="mr-1">{typeIcons[option.type] || '•'}</span>
              {option.service.split(' ')[0]}
            </Badge>
          );
        })}
        {remainingCount > 0 && (
          <Badge className="text-xs px-2 py-1 bg-gray-700/80 text-white backdrop-blur-sm">
            +{remainingCount}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1">
      {displayOptions.map((option, index) => {
        const colorClass = serviceColors[option.service] || 'bg-gray-600 text-white';
        return (
          <Badge
            key={index}
            className={`text-xs ${colorClass} flex items-center gap-1`}
          >
            <img
              src={option.serviceLogo || `/streaming-icons/${option.service.toLowerCase().replace(/\s+/g, '')}.svg`}
              alt={option.service}
              className="w-3 h-3 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            {option.service}
            <span className="opacity-75">{typeIcons[option.type] || '•'}</span>
          </Badge>
        );
      })}
      {remainingCount > 0 && (
        <Badge variant="secondary" className="text-xs">
          +{remainingCount} more
        </Badge>
      )}
    </div>
  );
};
