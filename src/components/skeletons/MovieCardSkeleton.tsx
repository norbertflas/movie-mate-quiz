import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const MovieCardSkeleton = () => {
  return (
    <Card className="h-[400px] animate-pulse">
      <div className="h-48 bg-muted rounded-t-lg" />
      <CardHeader className="space-y-2">
        <div className="h-4 w-3/4 bg-muted rounded" />
        <div className="h-3 w-1/2 bg-muted rounded" />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="h-3 w-full bg-muted rounded" />
        <div className="h-3 w-5/6 bg-muted rounded" />
        <div className="h-3 w-4/6 bg-muted rounded" />
      </CardContent>
    </Card>
  );
};