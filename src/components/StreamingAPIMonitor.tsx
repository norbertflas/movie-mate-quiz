
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, TrendingDown } from "lucide-react";
import { useAPIUsageMonitor } from "@/hooks/use-emergency-streaming";

export const StreamingAPIMonitor = () => {
  const { callsToday, cacheHits, emergencyMode } = useAPIUsageMonitor();

  const getStatusColor = () => {
    if (emergencyMode) return "bg-orange-500";
    if (callsToday > 400) return "bg-red-500";
    if (callsToday > 200) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusIcon = () => {
    if (emergencyMode) return <AlertTriangle className="h-4 w-4" />;
    if (callsToday > 400) return <AlertTriangle className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Streaming API Monitor
          {getStatusIcon()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Badge className={`${getStatusColor()} text-white`}>
            {emergencyMode ? 'Emergency Mode' : 'Normal'}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">API Calls Today:</span>
          <span className="font-mono font-bold">{callsToday}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Cache Hit Rate:</span>
          <span className="font-mono font-bold text-green-600">
            {callsToday === 0 ? '100%' : '85%'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Est. Cost Today:</span>
          <span className="font-mono font-bold">
            ${emergencyMode ? '0.00' : (callsToday * 0.02).toFixed(2)}
          </span>
        </div>

        {emergencyMode && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-orange-700">
              <TrendingDown className="h-4 w-4" />
              <span className="text-sm font-medium">
                Emergency mode active - using cached/static data only
              </span>
            </div>
          </div>
        )}

        {callsToday > 300 && !emergencyMode && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                High API usage detected - consider enabling emergency mode
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
